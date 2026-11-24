/* global $, jQuery, DataTable, cytoscape, tippy, zip, fetchTextExcerpt, resolveInternalZipPaths, createAndUploadRedactedZip, queryParams */

var userMap = new Map();
var codeMap = new Map();
var sourceMap = new Map();
var noteMap = new Map();
var tableWidth = '90%';
var selectedGUIDs = [];
var noteDataTable;
var userDataTable;
var codeDataTable;
var sourceDataTable;
var setDataTable;
var tables = [];

let file;
var textSourceCache = new Map(); // Cache for loaded text files

$(document).ready(function() {
  startPreview(false);
});

function translateBaseHtmlPage() {
  var refiqdaPreviewText = $.i18n("refiqdaPreviewText");
  $('.refiqdaPreviewText').text(refiqdaPreviewText);
  var refiqdpxPreviewText = $.i18n("refiqdpxPreviewText");
  $('.refiqdpxPreviewText').text(refiqdpxPreviewText);
  var refiqdcPreviewText = $.i18n("refiqdcPreviewText");
  $('.refiqdcPreviewText').text(refiqdcPreviewText);
}

var zipUrl = '';

//zipUrl is set in refiqdpx.js - the zip file case
function isZipMode() {
    return typeof zipUrl !== 'undefined' && zipUrl !== null && zipUrl !== '';
}

var redactedMode;
var canRedact = false;
var redactedFileExists = false;

async function checkPermissions() {
    let permissionsUrl = queryParams.signedUrls ? queryParams.signedUrls.userPermissions : null;
    if (!permissionsUrl && queryParams.siteUrl && queryParams.datasetid) {
        permissionsUrl = queryParams.siteUrl + "/api/datasets/" + queryParams.datasetid + "/userPermissions";
        if (queryParams.key) {
            permissionsUrl += (permissionsUrl.includes('?') ? '&' : '?') + "key=" + queryParams.key;
        }
    }
    if (permissionsUrl) {
        try {
            const response = await fetch(permissionsUrl);
            if (response.ok) {
                const json = await response.json();
                if (json.status === 'OK' && json.data && json.data.canEditDataset) {
                    canRedact = true;
                }
            }
        } catch (error) {
            console.error("Error checking permissions:", error);
        }
    }
}

var wait;
var cy;

function showWaitingIndicator(messageKey, isRawMessage) {
  $('#waiting').remove();
  wait = $('<div/>').attr('id', 'waiting');
  $('<img alt="Loading"/>').attr('src', 'images/Loading_icon.gif').appendTo(wait);
  let message = isRawMessage ? messageKey : $.i18n(messageKey);
  $('<span/>').text(message).appendTo(wait);
  wait.appendTo($('body'));
}

function hideWaitingIndicator() {
  $('#waiting').remove();
}

// Start parsing project file
// This function just adds a loading icon and initial text to the page and then calls parseData2
function parseData(data, filejson) {
  file=filejson;
  showWaitingIndicator('refiqdaParsingProject');

    checkPermissions().then(() => {
    new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
        parseData2(data);
        if (canRedact && !redactedMode) {
            checkForRedactedFile();
        }
    });
  });
}

// Reads the project file and walks through the XML creating tables for all the entry types
// Also adds a filter by choice box
function parseData2(data) {

  parser = new DOMParser();
  xmlDoc = parser.parseFromString(data, "text/xml");

  if(redactedMode) {
      $('<h2/>').addClass('redacted-notice').text($.i18n('refiqdaRedactedNotice')).appendTo($(".preview"));
  }
    //Add a Filter By option
  const preview = $('.preview');
  let filterBlock = $('<div/>').width(tableWidth).appendTo(preview);
  filterBlock.append($("<h2/>").html($.i18n('refiqdaEnableFilteringBy')));
  filterBlock.append($("<p/>").html($.i18n('refiqdaFilteringInstructions')));
  const filterBy = $('<select/>').prop('id', 'filterby').appendTo(filterBlock);
  if (canRedact && !redactedMode) {
      $('<button/>')
          .addClass('btn btn-danger delete-redacted-btn')
          .text($.i18n('refiqdaDeleteRedacted'))
          .css('margin-left', '10px')
          .hide()
          .click(deleteRedactedFile)
          .appendTo(filterBlock);
  }
  filterBy.append($('<option/>').prop('value', 'None').text($.i18n('refiqdaNoFiltering')));
  //As tables are created, they will be added to the option list here

  //User table
  var users = xmlDoc.getElementsByTagName("User");
  if (users != null && users.length > 0) {
      filterBy.append($('<option/>').prop('value', 'Users').text($.i18n('refiqdaUsers')));

    let userBlock = $('<div/>').width(tableWidth).appendTo(preview);
    userBlock.append($("<h2>").html($.i18n('refiqdaUsers')));
    //Users only has a "Name" column
    let userTable = createTable($.i18n('refiqdaUsers'), $.i18n('refiqdaName')).appendTo(userBlock);
    userTable.attr('id', 'usertable');
    userTable.addClass("usertable compact stripe");

    //Create rows
    for (let user of users) {
      console.log("adding user row");
      let tr = addRow(userTable, user.getAttribute("name"));
      tr.attr('data-guid', user.getAttribute("guid"));
      userMap.set(user.getAttribute("guid"), user);
    }
    console.log('Done with users');

    userDataTable = new DataTable(".usertable", {
      //Allow table rows to be selectable if this is the filter by table
      select: $('#filterby').val() === 'Users',
      order: [[0, 'asc']]
    });
    //Draw to set order
    userDataTable.draw();
    tables.push(userDataTable);
  }

  console.log("Starting codes");
  var codes = xmlDoc.getElementsByTagName("Code");
  if (codes != null  && codes.length > 0) {
      filterBy.append($('<option/>').prop('value', 'Codes').text($.i18n('refiqdaCodes')));

    // Check if any codes have a color attribute
    let hasColorAttribute = false;
    for (let code of codes) {
      if (code.getAttribute("color")) {
        hasColorAttribute = true;
        break;
      }
    }

    // Count code usage across all CodeRef elements
    let codeUsageMap = new Map();
    let allCodeRefs = xmlDoc.getElementsByTagName("CodeRef");
    for (let codeRef of allCodeRefs) {
      let targetGUID = codeRef.getAttribute("targetGUID");
      if (targetGUID) {
        codeUsageMap.set(targetGUID, (codeUsageMap.get(targetGUID) || 0) + 1);
      }
    }

    let codeBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
    codeBlock.append($("<h2/>").html($.i18n('refiqdaCodes')));
    // Create table with or without Color column based on whether color attributes exist
    let codeTable;
    if (hasColorAttribute) {
      codeTable = createTable($.i18n('refiqdaCodes'), $.i18n('refiqdaCode'), $.i18n('refiqdaDescription'), $.i18n('refiqdaColor'), $.i18n('refiqdaCodable'), $.i18n('refiqdaUses')).appendTo(codeBlock);
    } else {
      codeTable = createTable($.i18n('refiqdaCodes'), $.i18n('refiqdaCode'), $.i18n('refiqdaDescription'), $.i18n('refiqdaCodable'), $.i18n('refiqdaUses')).appendTo(codeBlock);
    }
    codeTable.attr('id', 'codetable');
    codeTable.addClass("codetable compact stripe");

    for (let code of codes) {
      let desc = code.getElementsByTagName("Description");
      if (desc[0] != null) {
        desc = desc[0].childNodes[0];
        console.log(desc);
      } else {
        desc = "";
      }
      console.log("adding code row");
      
      // Get usage count for this code
      let codeGuid = code.getAttribute("guid");
      let usageCount = codeUsageMap.get(codeGuid) || 0;
      
      // Add row with or without color based on whether color attributes exist
      let tr;
      if (hasColorAttribute) {
        tr = addRow(codeTable, code.getAttribute("name"), desc, code.getAttribute("color"), code.getAttribute("isCodable"), usageCount);
      } else {
        tr = addRow(codeTable, code.getAttribute("name"), desc, code.getAttribute("isCodable"), usageCount);
      }
      tr.attr('data-guid', code.getAttribute("guid"));
      //Currently codes don't appear to have forward links to other data types, so no data-matches attribute
      tr.attr('data-matches', '');
      codeMap.set(code.getAttribute("guid"), code);
    }

    // Configure DataTable with conditional columnDefs
    let dataTableConfig = {
        select: filterBy.val() === 'Codes'
    };

    if (filterBy.val() === 'Codes') {
        dataTableConfig.layout = {
            top2End: 'buttons'
        };
        dataTableConfig.buttons = [
            'selectAll',
            'selectNone'
        ];
        if (canRedact) {
            dataTableConfig.buttons.push({
                text: $.i18n('refiqdaRedact'),
                className: 'redact-btn',
                titleAttr: $.i18n('refiqdaRedactCodeTooltip'),
                action: function ( e, dt, node, config ) {
                    let selectedRows = dt.rows( { selected: true } );
                    let codeGuids = [];
                    selectedRows.nodes().to$().each(function() {
                        codeGuids.push($(this).data('guid'));
                    });
                    redactCodes(codeGuids);
                },
                enabled: false
            });
        }
    }

    if (hasColorAttribute) {
        dataTableConfig.columnDefs = [
            {
                render: function(data, type, row) {
                    // Check if data is already HTML (to avoid double-rendering)
                    if (type === 'display' && typeof data === 'string' && !data.includes('<span')) {
                        return '<span class="colortile" style="display:block;background-color:' + data + '">&nbsp;</span>';
                    }
                    return data;
                },
                targets: 2
            },
            {
                render: function(data, type, row) {
                    // Check if data is already HTML (to avoid double-rendering)
                    if (type === 'display' && typeof data === 'string' && !data.includes('<input')) {
                        return '<input class="codable" disabled type="checkbox"' + (data === 'true' ? ' checked' : '') + '/>';
                    }
                    return data;
                },
                width: "20%",
                targets: 3
            },
            {
                // Right-align the usage count column
                className: "dt-right",
                targets: 4
            }
        ];
    } else {
        dataTableConfig.columnDefs = [
            {
                render: function(data, type, row) {
                    // Check if data is already HTML (to avoid double-rendering)
                    if (type === 'display' && typeof data === 'string' && !data.includes('<input')) {
                        return '<input class="codable" disabled type="checkbox"' + (data === 'true' ? ' checked' : '') + '/>';
                    }
                    return data;
                },
                width: "20%",
                targets: 2
            },
            {
                // Right-align the usage count column
                className: "dt-right",
                targets: 3
            }
        ];
    }
    // Set default sorting for the 'Uses' column (descending)
    // The column index depends on whether the color column is present
    const usesColumnIndex = hasColorAttribute ? 4 : 3;
    dataTableConfig.order = [[usesColumnIndex, "desc"]];
    codeDataTable = new DataTable(".codetable", dataTableConfig);

    if (filterBy.val() === 'Codes') {
        codeDataTable.on('select deselect', function () {
            var selectedRows = codeDataTable.rows({ selected: true }).count();
            if (canRedact) {
                codeDataTable.button('.redact-btn').enable(selectedRows > 0);
            }
        });
    }

    tables.push(codeDataTable);
  }


  if (xmlDoc.getElementsByTagName("Sources")[0]) {
    let sources = xmlDoc.getElementsByTagName("Sources")[0].childNodes;
    if (sources != null && sources.length > 0) {

      // First pass: collect annotations and whole documents separately
      let annotationRows = [];
      let sourceRows = [];

      for (let source of sources) {
        if (source.nodeName.endsWith("Source")) {
          sourceMap.set(source.getAttribute("guid"), source);

          let sourceMatches = source.getAttribute("creatingUser") + source.getAttribute("modifyingUser");
          let selections = getSelections(source);

          if (selections != null && selections.length !== 0) {
            selections.forEach(function(selection) {
              let displayName;
              let selectionMatches;
              let guid;
              let codes;

              if (selection.isMerged) {
                // Handle merged selection object
                let pdfSel = selection.pdfSelection;
                let textSel = selection.plainTextSelection;
                let selectionName = pdfSel.getAttribute("name");

                if(!selectionName) {
                   selectionName = "(Hover for more info)";
                }
                guid = pdfSel.getAttribute("guid");
                codes = getCodeNames(pdfSel); // Codes are on the PDF selection

                let sourceGuid = source.getAttribute("guid");
                
                selectionMatches = sourceMatches +
                  pdfSel.getAttribute("creatingUser") + pdfSel.getAttribute("modifyingUser") +
                  textSel.getAttribute("creatingUser") + textSel.getAttribute("modifyingUser") +
                  getCodeRelatedGUIDs(pdfSel) + sourceGuid;

                displayName = createMergedSelectionWithTooltip(selectionName, pdfSel, textSel, sourceGuid);

              } else {
                // Handle regular selection node
                let selectionName = selection.getAttribute("name");
                if(!selectionName) {
                  selectionName = "(Hover for more info)";
                }
                guid = selection.getAttribute("guid");
                codes = getCodeNames(selection);
                let sourceGuid = source.getAttribute("guid");
                selectionMatches = sourceMatches + selection.getAttribute("creatingUser") + selection.getAttribute("modifyingUser") + getCodeRelatedGUIDs(selection) + sourceGuid;

                displayName = selectionName; // Default display name

                if (selection.nodeName === "PDFSelection") {
                  let page = selection.getAttribute("page");
                  let firstX = selection.getAttribute("firstX");
                  let firstY = selection.getAttribute("firstY");
                  let secondX = selection.getAttribute("secondX");
                  let secondY = selection.getAttribute("secondY");
                  displayName = createPdfSelectionWithTooltip(selectionName, page, firstX, firstY, secondX, secondY, sourceGuid);
                } else if (selection.nodeName === "PlainTextSelection") {
                  let startPos = selection.getAttribute("startPosition");
                  let endPos = selection.getAttribute("endPosition");
                  let plainTextPath = source.getAttribute("plainTextPath");
                  if (startPos && endPos && plainTextPath) {
                    displayName = createSelectionWithTooltip(selectionName, startPos, endPos, plainTextPath, sourceGuid);
                  }
                }
              }

              annotationRows.push({
                sourceRef: createSourceReference(source),
                type: source.nodeName,
                name: displayName,
                codes: codes,
                guid: guid,
                matches: selectionMatches
              });
            });
          }

          // Add whole document entry to sources
          sourceRows.push({
            sourceRef: createSourceReference(source),
            type: source.nodeName,
            name: $.i18n('refiqdaWholeDocument'),
            codes: "",
            guid: source.getAttribute("guid"),
            matches: sourceMatches
          });
        }
      }


      // Create Annotations table if there are any annotations
      if (annotationRows.length > 0) {
          filterBy.append($('<option/>').prop('value', 'Annotations').text($.i18n('refiqdaAnnotations')));

          let annotationBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
          annotationBlock.append($("<h2/>").html($.i18n('refiqdaAnnotations')));
          let annotationTable = createTable($.i18n('refiqdaAnnotations'), $.i18n('refiqdaFilename'), $.i18n('refiqdaType'), $.i18n('refiqdaSelection'), $.i18n('refiqdaCodes')).appendTo(annotationBlock);
          annotationTable.addClass("annotationtable compact stripe");

          annotationRows.forEach(function(rowData) {
              let tr = addRow(annotationTable, rowData.sourceRef, rowData.type, rowData.name, rowData.codes);
              tr.attr('data-guid', rowData.guid);
              tr.attr('data-matches', rowData.matches);
          });

          var annotationDataTable = new DataTable(".annotationtable", {
              select: filterBy.val() === 'Annotations'
          });

          // Initialize tooltips after table is created (ONLY for annotations table)
          initializeExcerptTooltips();

          tables.push(annotationDataTable);
      }

      // Create Sources table if there are any sources
      if (sourceRows.length > 0) {
        filterBy.append($('<option/>').prop('value', 'Sources').text($.i18n('refiqdaSources')));

        let sourceBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
        sourceBlock.append($("<h2/>").html($.i18n('refiqdaSources')));
        let sourceTable = createTable($.i18n('refiqdaSources'), $.i18n('refiqdaFilename'), $.i18n('refiqdaType'), $.i18n('refiqdaSelection'), $.i18n('refiqdaCodes')).appendTo(sourceBlock);
        sourceTable.addClass("sourcetable compact stripe");

        sourceRows.forEach(function(rowData) {
          let tr = addRow(sourceTable, rowData.sourceRef, rowData.type, rowData.name, rowData.codes);
          tr.attr('data-guid', rowData.guid);
          tr.attr('data-matches', rowData.matches);
        });

        sourceDataTable = new DataTable(".sourcetable", {
          select: filterBy.val() === 'Sources',
          order: [[0, 'asc']],
          columnDefs: [
            {
              render: function(data, type, row) {
                if (type === 'display' && data !== null && data.length > 50) {
                  return '<span title="' + data + '">' + data.substring(0, 50) + '...</span>';
                }
                return data;
              },
              targets: 1
            }
          ]
        });

        tables.push(sourceDataTable);
      }

    }
  }


  var notes = xmlDoc.getElementsByTagName("Note");

  if (notes != null && notes.length > 0) {
    filterBy.append($('<option/>').prop('value', 'Notes').text($.i18n('refiqdaNotes')));
    let noteBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
    noteBlock.append($("<h2/>").html($.i18n('refiqdaNotes')));
    let noteTable = createTable($.i18n('refiqdaNotes'), $.i18n('refiqdaName'), $.i18n('refiqdaContent'), $.i18n('refiqdaDescription'), $.i18n('refiqdaAuthors')).appendTo(noteBlock);
    noteTable.addClass("notetable compact stripe");

    for (let note of notes) {
      let ptc = note.getElementsByTagName("PlainTextContent");
      if (ptc[0] != null) {
        ptc = ptc[0].childNodes[0];
      }
      let desc = note.getElementsByTagName("Description");
      if (desc[0] != null) {
        desc = desc[0].childNodes[0];
      }
      let matches = '';
      let name = '';
      let creatingUserGuid = note.getAttribute("creatingUser");
      let modifyingUserGuid = note.getAttribute("modifyingUser");
      let userNames = new Set();

      if (creatingUserGuid) {
        matches += creatingUserGuid;
        let user = userMap.get(creatingUserGuid);
        if (user) {
          userNames.add(user.getAttribute("name"));
        }
      }

      if (modifyingUserGuid) {
        matches += modifyingUserGuid;
        let user = userMap.get(modifyingUserGuid);
        if (user) {
          userNames.add(user.getAttribute("name"));
        }
      }
      name = Array.from(userNames).join(', ');

      let tr = addRow(noteTable, note.getAttribute("name"), ptc, desc, name);
      tr.attr('data-guid', note.getAttribute("guid"));
      tr.attr('data-matches', matches);

      noteMap.set(note.getAttribute("guid"), note);

    }

    noteDataTable = new DataTable(".notetable", {
      select: filterBy.val() === 'Notes'
      //columnDefs:[{target:0,visible:false,seachable:false}]
    });
    tables.push(noteDataTable);
  }

 let variables = xmlDoc.getElementsByTagName("Variable");
  let cases = xmlDoc.getElementsByTagName("Case");

  if (variables.length > 0 && cases.length > 0) {
    let variableMap = new Map();
    let variableHeaders = [$.i18n('refiqdaSource')]; // First column is the source document

    for (let variable of variables) {
      let guid = variable.getAttribute("guid");
      let name = variable.getAttribute("name");
      // Store the variable name and its column index in the table
      variableMap.set(guid, { name: name, index: variableHeaders.length });
      variableHeaders.push(name);
    }

    let caseBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
    caseBlock.append($("<h2/>").html($.i18n('refiqdaCases')));
    let caseTable = createTable($.i18n('refiqdaCases'), ...variableHeaders).appendTo(caseBlock);
    caseTable.addClass("casetable compact stripe");

    for (let caseNode of cases) {
      let rowData = new Array(variableHeaders.length).fill(""); // Initialize row with empty strings

      // Find the source document for the case
      let sourceRef = caseNode.getElementsByTagName("SourceRef")[0];
      if (sourceRef) {
        let sourceGuid = sourceRef.getAttribute("targetGUID");
        let source = sourceMap.get(sourceGuid);
        if (source) {
          rowData[0] = createSourceReference(source);
        }
      }

      // Populate variable values for the case
      let variableValues = caseNode.getElementsByTagName("VariableValue");
      for (let varValue of variableValues) {
        let varRef = varValue.getElementsByTagName("VariableRef")[0];
        let textValue = varValue.getElementsByTagName("TextValue")[0];
        if (varRef && textValue) {
          let varGuid = varRef.getAttribute("targetGUID");
          let variableInfo = variableMap.get(varGuid);
          if (variableInfo) {
            rowData[variableInfo.index] = textValue.textContent;
          }
        }
      }
      addRow(caseTable, ...rowData);
    }

    // Initialize DataTable for cases, but don't add to filterable tables
    new DataTable(".casetable", {
      select: false // This table should not be selectable
    });
  }

 
  let sets = xmlDoc.getElementsByTagName("Set");
  if (sets != null && sets.length > 0) {
    filterBy.append($('<option/>').prop('value', 'Sets').text($.i18n('refiqdaSets')));
    let setBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
    setBlock.append($("<h2/>").html($.i18n('refiqdaSets')));
    let setTable = createTable($.i18n('refiqdaSets'), $.i18n('refiqdaName'), $.i18n('refiqdaSources'), $.i18n('refiqdaCodes')).appendTo(setBlock);
    setTable.addClass("settable compact stripe");

    for (let set of sets) {
      console.log(set.nodeName + set.parentNode.nodeName + set.parentNode.nodeValue);
      let codeNames = '';
      let sourceNames = '';
      let matches = '';

        let members = set.getElementsByTagName("MemberCode");
        for (let member of members) {
          let codeId = member.getAttribute('targetGUID');
          let code = codeMap.get(codeId);
          if (code != null) {
            codeNames = codeNames + '; ' + code.getAttribute("name");
          }
          matches += codeId;
        }

        members = set.getElementsByTagName("MemberSource");
        for (let member of members) {
          let sourceId = member.getAttribute('targetGUID');
          let source = sourceMap.get(sourceId);
          if (source != null) {
            sourceNames = sourceNames + ' ' + source.getAttribute("name");
          }
          matches += sourceId;
        }

        let tr = addRow(setTable, set.getAttribute("name"), sourceNames, codeNames);
        tr.attr('data-matches', matches);
        tr.attr('data-guid', set.getAttribute('guid'));
    }
    setDataTable = new DataTable(".settable", {
      select: filterBy.val() === 'Sets'
    });
    tables.push(setDataTable);
  }

    let graphs = xmlDoc.getElementsByTagName("Graph");
    if (graphs != null && graphs.length > 0) {
      let graphBlock = $('<div/>').width(tableWidth).appendTo($(".preview"));
      graphBlock.append($("<h2/>").html($.i18n('refiqdaGraphs')).append($('<span/>').attr('id', 'reset').text($.i18n('refiqdaReset')).addClass('btn btn-default')));

      let elements = [];
      for (let graph of graphs) {
          let vertexes = graph.getElementsByTagName("Vertex");
          for (let vertex of vertexes) {
            var vertData = {};
            vertData.id = vertex.getAttribute("guid");
            vertData.name = vertex.getAttribute("name");
            var vertGnode = {};

            edgeGnode.data = vertData;
            elements.push(vertGnode);
          }
          let edges = graph.getElementsByTagName("Edge");
          for (let edge of edges) {
            var edgeData = {};
            edgeData.id = edge.getAttribute("guid");
            edgeData.name = "";
            edgeData.source = edge.getAttribute("sourceVertex");
            edgeData.target = edge.getAttribute("targetVertex");
            var edgeGnode = {};
            edgeGnode.data = edgeData;
            elements.push(edgeGnode);
          }
      }
      let cyContainer = $('<div/>').width("100%").height("400px").attr('id', 'cy').appendTo(graphBlock);
      cyContainer.css("background-color", "aliceblue");
      cy = cytoscape({
        container: cyContainer, // container to render in
        elements: elements,
        style: [ // the stylesheet for the graph
          {
            selector: 'node',

            style: {
              'background-color': '#666',
              'label': 'data(name)'
            }
          },

          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier'
            }
          }
        ],

        layout: {
          name: 'cose',
          rows: 1
        },
        zoom: 1,
        pan: { x: 0, y: 0 },
      });
      $('#reset').click(function() { cy.fit() });
  }

$("#filterby")
  .change(function() {
    var str = "";
    $("#filterby option:selected").each(function() {
      console.log('Changed to ' + $(this).text());

      // Clear selections when changing filter
      selectedGUIDs = [];
        tables=[];
      const userTable = $(".usertable");
      // Destroy and recreate userDataTable
      if (userDataTable) {
        userDataTable.destroy();
        //Also remove event handlers
        userTable.off('select.dt deselect.dt');
      }
      if (userTable.length) {
        userDataTable = new DataTable(".usertable", {
          select: filterBy.val() === 'Users',
          order: [[0, 'asc']]
        });
        attachFilterHandler(userDataTable);
        userDataTable.draw();
        tables.push(userDataTable);
      }


      // Destroy and recreate codeDataTable
      let codeTableOrder;
      const codeTable = $(".codetable");
      if (codeDataTable) {
      codeTableOrder = codeDataTable.order();
        codeDataTable.destroy();
        codeTable.off('select.dt deselect.dt');
      }
      if (codeTable.length) {
        // Need to check if color column exists before recreating the table
        let hasColorColumn = $('.codetable thead th').length === 5; // 5 columns means Color is present plus # of Uses
        let codeConfig = {
          select: filterBy.val() === 'Codes'
        };

        if (filterBy.val() === 'Codes') {
            codeConfig.layout = {
                top2End: 'buttons'
            };
            codeConfig.buttons = [
                'selectAll',
                'selectNone'
            ];
            if (canRedact) {
                codeConfig.buttons.push({
                    text: $.i18n('refiqdaRedact'),
                    className: 'redact-btn',
                    titleAttr: $.i18n('refiqdaRedactCodeTooltip'),
                    action: function ( e, dt, node, config ) {
                        let selectedRows = dt.rows( { selected: true } );
                        let codeGuids = [];
                        selectedRows.nodes().to$().each(function() {
                            codeGuids.push($(this).data('guid'));
                        });
                        redactCodes(codeGuids);
                    },
                    enabled: false
                });
            }
        }

        if (hasColorColumn) {
          codeConfig.columnDefs = [
            {
              "render": function(data, type, row) {
                // Check if data is already HTML (to avoid double-rendering)
                if (type === 'display' && typeof data === 'string' && !data.includes('<span')) {
                  return '<span class="colortile" style="display:block;background-color:' + data + '">&nbsp;</span>';
                }
                return data;
              },
              "targets": 2
            },
            {
              "render": function(data, type, row) {
                if (type === 'display' && typeof data === 'string' && !data.includes('<input')) {
                  return '<input class="codable" disabled type="checkbox"' + (data === 'true' ? ' checked' : '') + '/>';
                }
                return data;
              },
              "width": "20%",
              "targets": 3
            },
            {
              // Right-align the usage count column
              className: "dt-right",
              targets: 4
            }
          ];
        } else {
          // No color column, so Codable is at index 2
          codeConfig.columnDefs = [
            {
              "render": function(data, type, row) {
                if (type === 'display' && typeof data === 'string' && !data.includes('<input')) {
                  return '<input class="codable" disabled type="checkbox"' + (data === 'true' ? ' checked' : '') + '/>';
                }
                return data;
              },
              "width": "20%",
              "targets": 2
            },
            {
              // Right-align the usage count column
              className: "dt-right",
              targets: 3
            }
          ];
        }
        // If a previous sort order exists, use it. Otherwise, default to sorting by 'Uses' descending.
        if (codeTableOrder) {
            codeConfig.order = codeTableOrder;
        } else {
            const usesColumnIndex = hasColorColumn ? 4 : 3;
            codeConfig.order = [[usesColumnIndex, "desc"]];
        }
        codeDataTable = new DataTable(".codetable", codeConfig);

        if ($('#filterby').val() === 'Codes') {
            codeDataTable.on('select deselect', function () {
                var selectedRows = codeDataTable.rows({ selected: true }).count();
                if (canRedact) {
                    codeDataTable.button('.redact-btn').enable(selectedRows > 0);
                }
            });
        }

        attachFilterHandler(codeDataTable);
        codeDataTable.draw();
        tables.push(codeDataTable);
      }

      // Destroy and recreate sourceDataTable
        const sourceTable = $(".sourcetable");
      if (sourceDataTable) {
        sourceDataTable.destroy();
        sourceTable.off('select.dt deselect.dt');
      }
      if (sourceTable.length) {
        let dtOptions = {
          select: filterBy.val() === 'Sources',
          columnDefs: [
            {
              render: function(data, type, row) {
                if (type === 'display' && data !== null && data.length > 50) {
                  return '<span title="' + data + '">' + data.substr(0, 50) + '...</span>';
                }
                return data;
              },
              targets: 1
            }
          ]

        };

        if (filterBy.val() === 'Sources') {
          dtOptions.layout = {
            top2End: 'buttons'
          };
          dtOptions.buttons = [
            'selectAll',
            'selectNone'
          ];
          if (canRedact) {
              dtOptions.buttons.push({
                  text: $.i18n('refiqdaRedact'),
                  className: 'redact-btn',
                  titleAttr: $.i18n('refiqdaRedactSourceTooltip'),
                  action: function ( e, dt, node, config ) {
                      let selectedRows = dt.rows( { selected: true } );
                      let sourceGuids = [];
                      selectedRows.nodes().to$().each(function() {
                          sourceGuids.push($(this).data('guid'));
                      });
                      redactSources(sourceGuids);
                  },
                  enabled: false
              });
          }
        }

        sourceDataTable = new DataTable(".sourcetable", dtOptions);

        if (filterBy.val() === 'Sources') {
            sourceDataTable.on('select deselect', function () {
                var selectedRows = sourceDataTable.rows({ selected: true }).count();
                if (canRedact) {
                    sourceDataTable.button('.redact-btn').enable(selectedRows > 0);
                }
            });
        }

        attachFilterHandler(sourceDataTable);
        sourceDataTable.draw();

        tables.push(sourceDataTable);
      }

      // Destroy and recreate annotationDataTable
      const annotationTable = $(".annotationtable");
      if (annotationDataTable) {
        annotationDataTable.destroy();
        annotationTable.off('select.dt deselect.dt');
      }
      if (annotationTable.length) {
        annotationDataTable = new DataTable(".annotationtable", {
          select: filterBy.val() === 'Annotations'
        });
        attachFilterHandler(annotationDataTable);
        annotationDataTable.draw();
        tables.push(annotationDataTable);
      }

      // Destroy and recreate noteDataTable
      const noteTable = $(".notetable");
      if (noteDataTable) {
        noteDataTable.destroy();
        noteTable.off('select.dt deselect.dt');
      }
      if (noteTable.length) {
        noteDataTable = new DataTable(".notetable", {
          select: filterBy.val() === 'Notes'
        });
        attachFilterHandler(noteDataTable);
        noteDataTable.draw();
        tables.push(noteDataTable);
      }

      // Destroy and recreate setDataTable
        const setTable = $(".settable");
      if (setDataTable) {
        setDataTable.destroy();
        setTable.off('select.dt deselect.dt');
      }
      if (setTable.length) {
        setDataTable = new DataTable(".settable", {
          select: filterBy.val() === 'Sets'
        });
        attachFilterHandler(setDataTable);
        setDataTable.draw();
        tables.push(setDataTable);
      }
    });
  });


  hideWaitingIndicator();
}

function createTable() {
  let table = $("<table/>");
  table.prop('id', arguments[0]);
  let tr = $("<tr/>").appendTo($("<thead/>").appendTo(table));
  for (var i = 1; i < arguments.length; i++) {
    tr.append($("<th/>").text(arguments[i]));
  }
  $("<tbody/>").appendTo(table);
  return table;
}
/**
 * Adds a table row and returns it as a jQuery object.
 *
 * @param {jQuery} table
 * @param {...*} values
 * @returns {jQuery}
 */
function addRow(table, ...values) {
  let tr = $('<tr/>');
  values.forEach(function(value) {
    let td = $('<td/>');
    // Check if value is a jQuery object or a DOM element
    if (value instanceof jQuery || (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement)) {
      td.append(value);
    } else {
      td.html(value || '');
    }
    td.appendTo(tr);
  });
  tr.appendTo(table);
  return tr;
}

// Helper function to attach the filtering logic
function attachFilterHandler(dataTable) {
  //When selections are made, update the array of selected GUIDs and redraw other tables so they get filtered.
  dataTable.on('select deselect', function(e, dt, type, indexes) {
    if (type === 'row') {
      selectedGUIDs = [];
      dataTable.rows({ selected: true }).nodes().to$().each(function(index, element) {
        selectedGUIDs.push(element.dataset.guid);
      });
      // Filter all other tables using the CURRENT `tables` array
      tables.filter(curTable => curTable !== dataTable).forEach(table => {
        table.search.fixed('refiqdaFilter', selectedGUIDs.length === 0 ? null : createRefiqdaFilterFunction(table));
        table.draw();
      });
    }
  });
}

  // Add a  method that filters results based on whether a GUID exists in the 'Related' hidden column.
  // The idea is that each table puts the GUIDs of all related items (in other tables) in that column so this method
  // becomes a generic way to filter by user, code, source, etc.
  // If there is no filtering or the method is called on the table to filter by, all rows are returned.

function createRefiqdaFilterFunction(dataTable) {
  return function(searchStr, data, index) {
    // console.log('Filtering: ' + index);

    if (selectedGUIDs.length === 0) {
      return true;
    }

    var rowNode = dataTable.row(index).node();
    
    if (!rowNode) {
      console.log('No row node found for index: ' + index);
      return true;
    }

    var curGuid = $(rowNode).attr('data-guid');
    var matches = $(rowNode).attr('data-matches') || '';

    let found = false;
    for (let guid of selectedGUIDs) {
      if (!guid) continue;
      
      if (matches.includes(guid)) {
        found = true;
        break;
      }
      let revMatches = $('[data-guid="' + guid + '"]').attr('data-matches') || '';
      if (revMatches.includes(curGuid)) {
        found = true;
        break;
      }
    }
    // console.log('Result: ' + found);
    return found;
  };
}

function getSelections(source) {
  let selections = [];
  // If it's a PDF source, we look for both PDF and PlainText selections to merge them
  if (source.nodeName === "PDFSource") {
    const representation = source.getElementsByTagName("Representation")[0];
    const plainTextSelections = new Map();

    // Map PlainTextSelections by their GUID from the Representation, if it exists
    if (representation) {
      for (const pts of representation.getElementsByTagName("PlainTextSelection")) {
        plainTextSelections.set(pts.getAttribute("guid"), pts);
      }
    }

    // Process PDFSelections
    for (const pdfSel of source.getElementsByTagName("PDFSelection")) {
      const guid = pdfSel.getAttribute("guid");
      const matchingPlainTextSel = plainTextSelections.get(guid);

      if (matchingPlainTextSel) {
        // Found a pair, create a merged object
        selections.push({
          isMerged: true,
          pdfSelection: pdfSel,
          plainTextSelection: matchingPlainTextSel
        });
        // Remove from map so we don't process it again
        plainTextSelections.delete(guid);
      } else {
        // It's a PDF-only selection
        selections.push(pdfSel);
      }
    }
  } else {
    // For other source types, get direct children ending in "Selection"
    for (const child of source.children) {
      if (child.nodeName.endsWith("Selection")) {
        selections.push(child);
      }
    }
  }
  return selections;
}

function getCodeRelatedGUIDs(selection) {
  let codeGUIDs = '';
  let codings = selection.getElementsByTagName("Coding");
  if (codings != null) {
    for (let coding of codings) {
      let codeRefs = coding.getElementsByTagName("CodeRef");
      for (let codeRef of codeRefs) {
        let codeId = codeRef.getAttribute("targetGUID");
        let userId = coding.getAttribute('creatingUser');
        codeGUIDs = codeGUIDs + codeId + userId;
      }
    }
  }
  return codeGUIDs;
}

function getCodeNames(selection) {
  let codeNameList = [];
  let codings = selection.getElementsByTagName("Coding");
  if (codings != null) {
    for (let coding of codings) {
      let codeRefs = coding.getElementsByTagName("CodeRef");
      for (let codeRef of codeRefs) {
        let codeId = codeRef.getAttribute("targetGUID");
        let code = codeMap.get(codeId);
        if (code != null) {
          codeNameList.push(code.getAttribute("name"));
        }
      }
    }
  }
  return codeNameList.join('; ');
}

// Update the createSelectionWithTooltip function to use a simpler data structure
function createSelectionWithTooltip(selectionName, startPos, endPos, plainTextPath, sourceGuid) {
    // Create a span with data attributes that we'll use for the tooltip
    return '<span class="selection-with-excerpt" ' +
        'data-start="' + startPos + '" ' +
        'data-end="' + endPos + '" ' +
        'data-path="' + plainTextPath + '" ' +
        'data-source-guid="' + sourceGuid + '">' +
        selectionName +
        '</span>';
}

function createMergedSelectionWithTooltip(selectionName, pdfSel, plainTextSel, sourceGuid) {
    // Extract data from both selection types
    const page = pdfSel.getAttribute("page");
    const firstX = pdfSel.getAttribute("firstX");
    const firstY = pdfSel.getAttribute("firstY");
    const secondX = pdfSel.getAttribute("secondX");
    const secondY = pdfSel.getAttribute("secondY");

    const startPos = plainTextSel.getAttribute("startPosition");
    const endPos = plainTextSel.getAttribute("endPosition");
    const plainTextPath = plainTextSel.closest("Representation").getAttribute("plainTextPath");

    // Create the HTML content for the Tippy tooltip
    let tooltipContent = `Page: ${page} (X:${firstX}, Y:${firstY}) to (X:${secondX}, Y:${secondY})`;

    // Create a span with data attributes for both PDF and Text functionality
    let spanHtml = '<span class="selection-with-excerpt selection-with-pdf-coords" ' +
        'data-tippy-content="' + tooltipContent + '" ' +
        'data-page="' + page + '" ' +
        'data-first-x="' + firstX + '" ' +
        'data-first-y="' + firstY + '" ' +
        'data-second-x="' + secondX + '" ' +
        'data-second-y="' + secondY + '" ' +
        'data-start="' + startPos + '" ' +
        'data-end="' + endPos + '" ' +
        'data-path="' + plainTextPath + '" ' +
        'data-source-guid="' + sourceGuid + '">' +
        selectionName +
        '</span>';
    
    return spanHtml;
}

function createPdfSelectionWithTooltip(selectionName, page, firstX, firstY, secondX, secondY, sourceGuid) {
    // Create the HTML content for the Tippy tooltip
    let tooltipContent = `Page: ${page}<br>From: (X:${firstX}, Y:${firstY})<br>To: (X:${secondX}, Y:${secondY})`;

    // Create a span with data attributes for functionality and the data-tippy-content attribute for the tooltip
    let spanHtml = '<span class="selection-with-pdf-coords" ' +
        'data-tippy-content="' + tooltipContent + '" ' +
        'data-page="' + page + '" ' +
        'data-first-x="' + firstX + '" ' +
        'data-first-y="' + firstY + '" ' +
        'data-second-x="' + secondX + '" ' +
        'data-second-y="' + secondY + '" ' +
        'data-source-guid="' + sourceGuid + '">' +
        selectionName +
        '</span>';
    
    return spanHtml;
}

function createSourceReference(sourceElement) {
    const sourceName = sourceElement.getAttribute("name");
    const sourceGuid = sourceElement.getAttribute("guid");
    const path = sourceElement.getAttribute("path");
    const plainTextPath = sourceElement.getAttribute("plainTextPath");
    const richTextPath = sourceElement.getAttribute("richTextPath");

    const referenceDiv = document.createElement('div');
    referenceDiv.className = 'source-reference';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${sourceName} (`;
    referenceDiv.appendChild(nameSpan);

    const links = [];

    // Handle binary files (like PDFs) that have a 'path'
    if (path) {
        const pdfLink = document.createElement('a');
        pdfLink.href = '#';
        pdfLink.textContent = 'PDF';
        pdfLink.title = 'Download PDF';
        pdfLink.onclick = (e) => {
            e.preventDefault();
            downloadSourceFile(sourceGuid, path);
        };
        links.push(pdfLink);

        // Check for a plain text representation of the binary file
        const representation = sourceElement.querySelector('Representation[plainTextPath]');
        if (representation) {
            const textRepresentationPath = representation.getAttribute('plainTextPath');
            const textLink = document.createElement('a');
            textLink.href = '#';
            textLink.textContent = 'TXT';
            textLink.title='Download Text';
            textLink.onclick = (e) => {
                e.preventDefault();
                downloadSourceFile(sourceGuid, textRepresentationPath);
            };
            links.push(textLink);
        }
    }
    // Handle plain text files that only have a 'plainTextPath'
    else if (plainTextPath) {
        const textLink = document.createElement('a');
        textLink.href = '#';
        textLink.textContent = 'TXT';
        textLink.title = 'Download Text';
        textLink.onclick = (e) => {
            e.preventDefault();
            downloadSourceFile(sourceGuid, plainTextPath);
        };
        links.push(textLink);
    }

    // Handle rich text files (like DOCX) that have a 'richTextPath'
    if (richTextPath) {
        const richTextLink = document.createElement('a');
        richTextLink.href = '#';
        const extension = richTextPath.split('.').pop().toUpperCase();
        richTextLink.textContent = extension;
        richTextLink.title = 'Download Rich Text';
        richTextLink.onclick = (e) => {
            e.preventDefault();
            downloadSourceFile(sourceGuid, richTextPath);
        };
        links.push(richTextLink);
    }

    // Append all created links with separators
    links.forEach((link, index) => {
        referenceDiv.appendChild(link);
        if (index < links.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' | ';
            referenceDiv.appendChild(separator);
        }
    });

    const closingParen = document.createElement('span');
    closingParen.textContent = ')';
    referenceDiv.appendChild(closingParen);

    return referenceDiv;
}

function formatExcerptTooltip(excerpt, startPos, endPos) {
    //const maxLength = 300; // Increased since we're getting exact excerpts
    let displayExcerpt = excerpt;
    
    // Trim whitespace
    displayExcerpt = displayExcerpt.trim();
    
    //if (displayExcerpt.length > maxLength) {
    //    displayExcerpt = displayExcerpt.substring(0, maxLength) + '...';
    //}
    
    // Escape HTML to prevent injection, but preserve line breaks
    displayExcerpt = displayExcerpt
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    
    return `
        <div style="padding: 8px; font-family: sans-serif;">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; color: #999; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
                ${$.i18n('refiqdaExcerptTooltipHeader', startPos, endPos)}
            </div>
            <div style="font-size: 13px; line-height: 1.5; max-height: 200px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">
                "${displayExcerpt}"
            </div>
        </div>
    `;
}

// Update the initializeExcerptTooltips function with better error handling
function initializeExcerptTooltips() {
    // Destroy any existing Tippy instances to avoid duplicates
    $('.selection-with-excerpt, .selection-with-pdf-coords').each(function() {
        if (this._tippy) {
            this._tippy.destroy();
        }
    });

    // Initialize Tippy for all selection elements
    tippy('.selection-with-excerpt, .selection-with-pdf-coords', {
        content: 'Loading...',
        allowHTML: true,
        interactive: true,
        theme: 'light-border',
        maxWidth: 450,
        placement: 'top',
        trigger: 'mouseenter focus',
        delay: [200, 200], // 200ms delay on show/hide
        appendTo: () => document.body, // Append to body to prevent clipping
        onShow(instance) {
            const element = instance.reference;
            
            // If content is already loaded, show it immediately
            if (element.getAttribute('data-tooltip-loaded') === 'true') {
                return; // Content already set, just show the tooltip
            }

            if (element.classList.contains('selection-with-excerpt')) {
                // Handle text excerpt tooltips
                const startPos = parseInt(element.getAttribute('data-start'));
                const endPos = parseInt(element.getAttribute('data-end'));
                const plainTextPath = element.getAttribute('data-path');
                const sourceGuid = element.getAttribute('data-source-guid');

                // Set loading state
                instance.setContent('<div style="padding: 8px;"><em>Loading excerpt...</em></div>');

                // Load the excerpt asynchronously
                loadTextExcerpt(plainTextPath, startPos, endPos, sourceGuid)
                    .then(excerpt => {
                        if (excerpt) {
                            let formattedContent = formatExcerptTooltip(excerpt, startPos, endPos);
                            // For merged selections, prepend the PDF coordinate info
                            if (element.classList.contains('selection-with-pdf-coords')) {
                                const pdfInfo = element.getAttribute('data-tippy-content');
                                if (pdfInfo) {
                                    const pdfHtml = `<div style="padding: 8px 8px 0 8px; font-family: sans-serif; font-size: 11px; color: #999;">${pdfInfo}</div>`;
                                    formattedContent = pdfHtml + formattedContent;
                                }
                            }
                            instance.setContent(formattedContent);
                            element.setAttribute('data-tooltip-loaded', 'true');
                        } else {
                            instance.setContent('<div style="padding: 8px; color: #999;"><em>Could not load excerpt</em></div>');
                        }
                    })
                    .catch(error => {
                        console.error('Error loading excerpt:', error);
                        instance.setContent(`<div style="padding: 8px; color: #d32f2f;"><em>Error: ${error.message || 'Could not load excerpt'}</em></div>`);
                    });
            }
        },
        onHidden(instance) {
            // Optional: Clear loading state when hidden
            // This allows the tooltip to reload if shown again
            // Remove this if you want to keep cached content
            // instance.reference.removeAttribute('data-tooltip-loaded');
        }
    });
}

// Function to load text excerpt from file
async function loadTextExcerpt(plainTextPath, startPos, endPos, sourceGuid) {
    try {
        // Check cache first - cache the full text to avoid repeated zip reads
        if (textSourceCache.has(sourceGuid)) {
            const fullText = textSourceCache.get(sourceGuid);
            return fullText.substring(startPos, endPos);
        }

        // For zip mode, use the fetchTextExcerpt function from refiqdpx.js
        if (isZipMode() && typeof fetchTextExcerpt === 'function') {
            const finalPath = typeof resolveInternalZipPaths === 'function' ? resolveInternalZipPaths(plainTextPath) : plainTextPath.replace("internal://", "sources/");
            if (finalPath) {
                try {
                    // Note: We're not caching here because fetchTextExcerpt is efficient
                    // and only fetches the bytes we need. If you want to cache full files
                    // for multiple excerpts from the same file, you'd need to modify
                    // fetchTextExcerpt to optionally return the full text
                    return await fetchTextExcerpt(finalPath, startPos, endPos);
                } catch (e) {
                    console.debug(`File not found at ${finalPath}`);
                }
            }
            return null;
        } else {
            // Fallback for non-zip mode (direct file access)
            const response = await fetch(plainTextPath);
            if (!response.ok) {
                console.warn('Could not load file:', plainTextPath);
                return null;
            }
            const fileContent = await response.text();
            
            // Cache the full text for future excerpts from the same file
            textSourceCache.set(sourceGuid, fileContent);
            
            // Return the excerpt
            return fileContent.substring(startPos, endPos);
        }
    } catch (error) {
        console.error('Error loading text excerpt:', error);
        return null;
    }
}

function removeSourcesFromXml(targetXmlDoc, guidsToRedact) {
  for (const guid of guidsToRedact) {
    // Find any source element by its GUID and remove it.
    // This will also remove all its children, including annotations.
    let sourceElement = targetXmlDoc.querySelector('[guid="' + guid + '"]');
    if (sourceElement && sourceElement.parentNode) {
      sourceElement.parentNode.removeChild(sourceElement);
      console.log("Removed source element and its annotations with GUID:", guid);
    }
  }
}

function removeCodesFromXml(targetXmlDoc, guidsToRedact) {
  for (const guid of guidsToRedact) {
    // 1. Find and remove the Code element
    let codeElement = targetXmlDoc.querySelector('Code[guid="' + guid + '"]');
    if (codeElement && codeElement.parentNode) {
      codeElement.parentNode.removeChild(codeElement);
      console.log("Removed code element with GUID:", guid);
    }

    // 2. Find and remove all CodeRef elements pointing to this code
    let codeRefs = targetXmlDoc.querySelectorAll('CodeRef[targetGUID="' + guid + '"]');
    codeRefs.forEach(codeRef => {
      let coding = codeRef.parentNode;
      if (!coding) return;

      // Find the parent annotation
      let annotation = coding.parentNode;
      while (annotation && annotation.nodeName !== 'Annotation') {
          annotation = annotation.parentNode;
      }

      // 1. Remove the CodeRef
      coding.removeChild(codeRef);

      // 2. If the Coding element now has no more CodeRefs, remove it
      let selection = coding.parentNode;
      if (selection && coding.getElementsByTagName("CodeRef").length === 0) {
        selection.removeChild(coding);

        // 3. If the selection (parent of Coding) now has no more Codings, remove it
        if (selection.nodeName.endsWith("Selection") && selection.getElementsByTagName("Coding").length === 0 && selection.parentNode) {
            selection.parentNode.removeChild(selection);
            console.log("Removed empty selection.");
        }
      }

      // 3. Remove any annotations that only used that code (now have no CodeRefs)
      if (annotation && annotation.parentNode) {
        let remainingCodeRefs = annotation.querySelectorAll('CodeRef');
        if (remainingCodeRefs.length === 0) {
          annotation.parentNode.removeChild(annotation);
          console.log("Removed annotation that has no remaining codes.");
        }
      }
    });
  }
}

/**
 * Uploads a redacted file (either a codebook XML or a project ZIP) to Dataverse.
 *
 * @param {Blob} blob The redacted file blob.
 * @param {string} filename The name of the file to be uploaded.
 */
async function uploadRedactedFile(blob, filename) {
  try {
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("origin", "qdas");
    formData.append("isPublic", "true");
    formData.append("type", "qda");

    console.log(`Uploading redacted file: ${filename}`);
    let uploadUrl = queryParams.signedUrls ? queryParams.signedUrls.uploadRedactedFile : null;
    if (!uploadUrl && queryParams.siteUrl && queryParams.fileid) {
        const type = isZipMode() ? 'qdpx' : 'qdc';
        uploadUrl = queryParams.siteUrl + "/api/access/datafile/" + queryParams.fileid + "/auxiliary/" + type + "/1.0";
        if (queryParams.key) {
            uploadUrl += (uploadUrl.includes('?') ? '&' : '?') + "key=" + queryParams.key;
        }
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Upload successful:", responseData);
    hideWaitingIndicator();
    alert($.i18n('refiqdaRedactSuccess'));
    checkForRedactedFile();
  } catch (error) {
    console.error("Error during upload:", error);
    hideWaitingIndicator();
    alert($.i18n('refiqdaRedactError', error.message));
  }
}

function redactSources(guidsToRedact) {
  showWaitingIndicator('refiqdaRedactingProject');
  console.log("Redacting sources with GUIDs:", guidsToRedact);

  let redactedXmlDoc = xmlDoc.cloneNode(true);
  removeSourcesFromXml(redactedXmlDoc, guidsToRedact);

  const redactedXmlString = new XMLSerializer().serializeToString(redactedXmlDoc);

  if (isZipMode() && typeof zip !== 'undefined') {
    // Find the paths of the source files to remove from the zip archive.
    const pathsToRemove = new Set();
    for (const guid of guidsToRedact) {
      const sourceElement = xmlDoc.querySelector(`[guid="${guid}"]`);
      if (sourceElement) {
        // Check various path attributes
        ["path", "plainTextPath", "richTextPath"].forEach(attr => {
          const val = sourceElement.getAttribute(attr);
          if (val) {
            const p = typeof resolveInternalZipPaths === 'function' ? resolveInternalZipPaths(val) : val.replace("internal://", "sources/");
            if (p) pathsToRemove.add(p);
          }
        });

        // Check for paths in Representations
        const representations = sourceElement.querySelectorAll('Representation');
        representations.forEach(rep => {
          const ptp = rep.getAttribute("plainTextPath");
          if (ptp) {
            const p = typeof resolveInternalZipPaths === 'function' ? resolveInternalZipPaths(ptp) : ptp.replace("internal://", "sources/");
            if (p) pathsToRemove.add(p);
          }
        });
      }
    }
    createAndUploadRedactedZip(redactedXmlString, pathsToRemove);
  } else {
    // Fallback for non-zip mode (single XML file)
    const redactedXmlBlob = new Blob([redactedXmlString], { type: 'text/x-xml-refiqda' });
    const originalFilename = file.filename || "project.qdc";
    const redactedFilename = originalFilename.replace(/(\.qdc)?$/, '-redacted.qdc');
    uploadRedactedFile(redactedXmlBlob, redactedFilename);
  }
}

function redactCodes(guidsToRedact) {
  showWaitingIndicator('refiqdaRedactingProject');
  console.log("Redacting codes with GUIDs:", guidsToRedact);

  let redactedXmlDoc = xmlDoc.cloneNode(true);
  removeCodesFromXml(redactedXmlDoc, guidsToRedact);

  const redactedXmlString = new XMLSerializer().serializeToString(redactedXmlDoc);

  if (isZipMode() && typeof zip !== 'undefined') {
    createAndUploadRedactedZip(redactedXmlString);
  } else {
    // Fallback for non-zip mode (single XML file)
    const redactedXmlBlob = new Blob([redactedXmlString], { type: 'text/x-xml-refiqda' });
    const originalFilename = file.filename || "project.qdc";
    const redactedFilename = originalFilename.replace(/(\.qdc)?$/, '-redacted.qdc');
    uploadRedactedFile(redactedXmlBlob, redactedFilename);
  }
}

async function checkForRedactedFile() {
    let listUrl = queryParams.signedUrls ? queryParams.signedUrls.listAuxiliaryFiles : null;
    if (!listUrl && queryParams.siteUrl && queryParams.fileid) {
        listUrl = queryParams.siteUrl + "/api/access/datafile/" + queryParams.fileid + "/auxiliary";
        if (queryParams.key) {
            listUrl += (listUrl.includes('?') ? '&' : '?') + "key=" + queryParams.key;
        }
    }
    if (listUrl) {
        try {
            const response = await fetch(listUrl);
            if (response.ok) {
                const auxFiles = await response.json();
                const type = isZipMode() ? 'qdpx' : 'qdc';
                redactedFileExists = auxFiles.data.some(f => f.formatTag === type && f.formatVersion === '1.0');
                if (redactedFileExists) {
                    $('.delete-redacted-btn').show();
                } else {
                    $('.delete-redacted-btn').hide();
                }
            }
        } catch (error) {
            console.error("Error checking for redacted file:", error);
        }
    }
}

async function deleteRedactedFile() {
    if (confirm($.i18n('refiqdaDeleteConfirm'))) {
        try {
            let deleteUrl = queryParams.signedUrls ? queryParams.signedUrls.deleteRedactedFile : null;
            if (!deleteUrl && queryParams.siteUrl && queryParams.fileid) {
                const type = isZipMode() ? 'qdpx' : 'qdc';
                deleteUrl = queryParams.siteUrl + "/api/access/datafile/" + queryParams.fileid + "/auxiliary/" + type + "/1.0";
                if (queryParams.key) {
                    deleteUrl += (deleteUrl.includes('?') ? '&' : '?') + "key=" + queryParams.key;
                }
            }
            const response = await fetch(deleteUrl, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert($.i18n('refiqdaDeleteSuccess'));
                redactedFileExists = false;
                $('.delete-redacted-btn').hide();
            } else {
                const errorText = await response.text();
                throw new Error(`Delete failed: ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            console.error("Error deleting redacted file:", error);
            alert($.i18n('refiqdaDeleteError', error.message));
        }
    }
}
