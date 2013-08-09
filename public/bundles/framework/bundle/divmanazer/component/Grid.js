/**
 * @class Oskari.userinterface.component.Grid
 *
 * Renders given data model as a grid/table. Provides sorting funtionality.
 * If table data is structured to have "inner tables" -> #setAdditionalDataHandler
 * method can be used to set a callback which will show the additional data externally
 * to keep the table clean.
 */
Oskari.clazz.define('Oskari.userinterface.component.Grid',

/**
 * @method create called automatically on construction
 * @static
 */
function(columnSelectorTooltip) {
    this.model = null;
    var columnSelectorButtonTitle = "";
    if (typeof columnSelectorTooltip !== "undefined") columnSelectorButtonTitle = columnSelectorTooltip;
    this.template = jQuery('<table class="oskari-grid"><thead><tr></tr></thead><tbody></tbody></table>');
    this.templateTableHeader = jQuery('<th><a href="JavaScript:void(0);"></a></th>');
    this.templateRow = jQuery('<tr></tr>');
    this.templateCell = jQuery('<td></td>');
    this.templatePopupLink = jQuery('<a href="JavaScript: void(0);"></a>');
    this.templateColumnSelectorButtonWrapper = jQuery('<div/>', {
    });
    this.templateColumnSelectorButton = jQuery('<div/>', {
        title: columnSelectorButtonTitle
    });
    this.templateColumnSelector = jQuery('<div/>', {
    });
    this.templateColumnSelectorList = jQuery('<ul/>',{
    });
    this.templateColumnSelectorListItem = jQuery('<li>'+
        '<div>'+
        '<input type="checkbox"/>'+
        '<label></label>'+
        '</div>'+
        '</li>'
    );
    this.templateColumnSelectorClose = jQuery('<div class="icon-close close-selector-button"></div>');
    this.table = null;
    this.fieldNames = [];
    this.selectionListeners = [];
    this.additionalDataHandler = null;
    this.visibleColumnSelector = null;
    this.showColumnSelector = false;
    this.resizableColumns = false;

    this.uiNames = {};
    this.valueRenderer = {};

    // last sort parameters are saved so we can change sort direction if the same column is sorted again
    this.lastSort = null;
}, {
    /**
     * @method setDataModel
     * Sets the data model the grid uses for rendering
     * @param {Oskari.userinterface.component.GridModel} pData
     */
    setDataModel : function(pData) {
        this.model = pData;
    },
    /**
     * @method getDataModel
     * Returns the data model the grid uses for rendering
     * @return {Oskari.userinterface.component.GridModel}
     */
    getDataModel : function() {
        return this.model;
    },

    /**
     * @method setColumnSelector
     * Sets the column selector visible or invisible
     * @param {Boolean} newShowColumnSelector truth value for showing a column selector
     */
    setColumnSelector : function(newShowColumnSelector) {
        this.showColumnSelector = newShowColumnSelector;
    },
    /**
     * @method setResizableColumns
     * Sets the columns resizable or static
     * @param {Boolean} newResizableColumns truth value for column resizability
     */
    setResizableColumns : function(newResizableColumns) {
        this.resizableColumns = newResizableColumns;
    },
    /**
     * @method setColumnUIName
     * Sets an UI text for a given field.
     * The grid shows the UI name instead of the datas field name
     * @param {String} fieldName field name we want to replace in UI
     * @param {String} uiName field name we want to use instead in UI
     */
    setColumnUIName : function(fieldName, uiName) {
        this.uiNames[fieldName] = uiName;
    },
    /**
     * @method setColumnValueRenderer
     * When rendering the field value the given renderer function is called if given.
     * The function takes the value as parameter and should return the processed value:
     * function({String} value, {Object} rowData) {
     *     return value;
     * }
     * RowData parameter includes the object being rendered including
     * the value so renderer has access to id and such
     * @param {String} fieldName field name we want to process before showing in ui
     * @param {String} renderer function that will process the value
     */
    setColumnValueRenderer : function(fieldName, renderer) {
        this.valueRenderer[fieldName] = renderer;
    },
    /**
     * @method setVisibleFields
     * If not given renders all data fields
     * @param {String[]} pFieldNames fieldnames that should be rendered from data
     */
    setVisibleFields : function(pFieldNames) {
        this.fieldNames = pFieldNames;
    },
    /**
     * @method addSelectionListener
     * The callback function will receive reference to the grid in question as first parameter
     * and the id for the selected data as second parameter:
     * function({Oskari.userinterface.component.Grid} grid, {String} dataId)
     * @param {function} pCallback callback to call when a row has been selected
     */
    addSelectionListener : function(pCallback) {
        this.selectionListeners.push(pCallback);
    },
    /**
     * @method setAdditionalDataHandler
     * If grid data has internal table structures, it can be hidden behind a link
     * by using this method. This way the grid stays more clear.
     * @param {String} title text for the link
     * @param {function} handler callback to call when the link is clicked
     */
    setAdditionalDataHandler : function(title, handler) {
        this.additionalDataHandler =  {
            title : title,
            handler : handler
        };
    },

    /**
     * @method _createAdditionalDataField
     * Renders the given data using #_renderAdditionalData() and wraps it with a linked callback if
     * #setAdditionalDataHandler() has been used.
     * @private
     * @param {Object[]} data data to be rendered
     * @return (jQuery) reference to rendered content
     */
    _createAdditionalDataField: function(data) {
        var content = this._renderAdditionalData(data);
        // if handler set -> show link instead
        // exception if data is an array (=has size method)
        if(!data.size && this.additionalDataHandler) {
            var me = this;
            var link = this.templatePopupLink.clone();
            link.append(this.additionalDataHandler.title);
            link.bind('click', function() {
                // show userguide popup with data
                me.additionalDataHandler.handler(link, content);
                return false;
            });
            return link;
        }
        return content;

    },
    /**
     * @method _renderAdditionalData
     * Renders the given data to a table or comma separated list depending on type
     * @private
     * @param {Object[]} data data to be rendered
     * @return (jQuery) reference to rendered content
     */
    _renderAdditionalData: function(data) {
        if(data.size) {
            // array data
            var value = '';
            for(var i=0; i < data.size();++i) {
                if(i != 0) {
                    value = value + ', ';
                }
                value = value + data[i];
            }
            return value;
        }
        // else format as table
        var table = this.template.clone();
        var body = table.find('tbody');
        for(var field in data) {
            var row = this.templateRow.clone();
            var value = data[field];
            var fieldCell = this.templateCell.clone();
            fieldCell.append(field);
            row.append(fieldCell);

            //row.append('<td>' + field + '</td>');
            var valueCell = this.templateCell.clone();
            try {
                var type = typeof value;
                if(type === 'object') {
                    var innerTable = this._renderAdditionalData(value);
                    valueCell.append(innerTable);
                }
                else if(type !== 'function'){
                    valueCell.append(value);
                }
                else {
                    // we have a problem, debug
                    //alert(type + ':\r\n' +JSON.stringify(data));
                }
                row.append(valueCell);
            } catch(ignored) {}

            body.append(row);
        }
        return table;
    },
    /**
     * @method _renderHeader
     * Renders the header part for data in #getDataModel() to the given table.
     * @private
     * @param {jQuery} table reference to the table DOM element whose header should be populated
     * @param {String[]} fieldNames names of the fields to render in render order
     */
    _renderHeader: function(table, fieldNames) {
        var me = this;
        // print header
        var headerContainer = table.find('thead tr');
        var bodyContainer = table.find('tbody');

        // header reference needs some closure magic to work here
        var headerClosureMagic = function(scopedValue) {
            return function() {
                // reference to sort link element
                var link = jQuery(this);
                // get previous selection
                var selection = me.getSelection();
                // clear table for sorted results
                bodyContainer.empty();
                // default to descending sort
                var descending = false;
                // if last sort was made on the same column -> change direction
                if(me.lastSort && me.lastSort.attr == scopedValue) {
                    descending = !me.lastSort.descending;
                }

                // sort the results
                me._sortBy(scopedValue, descending);
                // populate table content
                me._renderBody(table, fieldNames);
                // apply visual changes
                headerContainer.find('th').removeClass('asc');
                headerContainer.find('th').removeClass('desc');
                if(descending) {
                    link.parent().addClass('desc');
                }
                else {
                    link.parent().addClass('asc');
                }
                // reselect selection
                var idField = me.model.getIdField();
                for(var i = 0; i < selection.length; ++i) {
                    me.select(selection[i][idField], true);
                }
                return false;
            };
        };
        for(var i=0; i < fieldNames.length; ++i) {
            var header = this.templateTableHeader.clone();
            var link = header.find('a');
            var fieldName = fieldNames[i];
            var uiName = this.uiNames[fieldName];
            if(!uiName) {
                uiName = fieldName;
            }
            link.append(uiName);
            if(me.lastSort && fieldName == me.lastSort.attr) {
                if(me.lastSort.descending) {
                    header.addClass('desc');
                }
                else {
                    header.addClass('asc');
                }
            }
            link.bind('click', headerClosureMagic(fieldNames[i]));
            headerContainer.append(header);
        }
    },
    /**
     * @method _renderBody
     * Renders the data in #getDataModel() to the given table.
     * @private
     * @param {jQuery} table reference to the table DOM element whose body should be populated
     * @param {String[]} fieldNames names of the fields to render in render order
     */
    _renderBody: function(table, fieldNames) {
        var me = this;
        // print data
        var body = table.find('tbody');
        var dataArray = this.model.getData();
        for(var i=0; i < dataArray.length; ++i) {
            var row = this.templateRow.clone();
            var data =  dataArray[i];

            row.attr('data-id', data[this.model.getIdField()]);
            for(var f=0; f < fieldNames.length; ++f) {
                var key = fieldNames[f];
                var value = data[key];

                var cell = this.templateCell.clone();
                if(typeof value === 'object') {
                    cell.append(this._createAdditionalDataField(value));
                }
                else {
                    var renderer = this.valueRenderer[key];
                    if(renderer) {
                        value = renderer(value, data);
                    }
                    cell.append(value);
                }
                row.append(cell);
            }
            body.append(row);
        }
        // innertable might mix this up
        var rows = table.find('tbody tr');
        var rowClicked = function() {
            me._dataSelected(jQuery(this).attr('data-id'));
        }
        rows.bind('click', rowClicked);
        // enable links to work normally (unbind row click on hover and rebind when mouse exits)
        rows.find('a').hover(function() {
            jQuery(this).parents('tr').unbind('click');
        }, function() {
            jQuery(this).parents('tr').bind('click', rowClicked);
        });
    },

    /**
     * @method _renderColumnSelector
     * Renders the column selector for the given table.
     * @private
     * @param {jQuery} table reference to the table DOM element
     * @param {String[]} fieldNames names of the fields to select visible
     */
    _renderColumnSelector: function(table, fieldNames) {

        // Utilize the templates
        this.visibleColumnSelector = this.templateColumnSelectorButtonWrapper.clone();
        var columnSelectorButton = this.templateColumnSelectorButton.clone();
        var columnSelector = this.templateColumnSelector.clone();
        var columnSelectorList = this.templateColumnSelectorList.clone();
        var columnSelectorClose = this.templateColumnSelectorClose.clone();

        this.visibleColumnSelector.addClass('column-selector-placeholder');
        columnSelectorButton.addClass('icon-menu');
        columnSelector.addClass('column-selector');

        this.visibleColumnSelector.append(columnSelectorButton);
        this.visibleColumnSelector.append(columnSelector);

        var me = this;
        jQuery('input.column-selector-list-item').remove();
        // Open or close the checkbox dropdown list
        columnSelectorButton.click(function() {
            if (columnSelector.css('visibility') !== 'hidden') {
                columnSelector.css('visibility', 'hidden');
            } else {
                columnSelector.css('visibility', 'visible');
            }
        });
        columnSelectorClose.click(function(e){
            e.stopPropagation();
            columnSelector.css('visibility', 'hidden');
        });
        var fields = this.model.getFields();
        var visibleField;
        // Add field names to the list
        for (var i=0; i<fields.length; i++) {
            visibleField = false;
            // Set current checkbox value for the field
            for (var j=0; j<fieldNames.length; j++) {
                if (fields[i] === fieldNames[j]) {
                    visibleField = true;
                    break;
                }
            }
            var newColumn = this.templateColumnSelectorListItem.clone();
            newColumn.addClass('column-selector-list-item');
            var checkboxInput = newColumn.find('input');
            checkboxInput.attr('checked',visibleField);
            checkboxInput.addClass('column-selector-list-item');
            checkboxInput.attr('id',fields[i]);
            newColumn.find('label')
                .attr({'for': fields[i], 'class': 'column-label'})
                .html(fields[i]);
            newColumn.css({'margin':'5px'});

            // Update visible fields after checkbox change
            checkboxInput.change(function() {
                var fieldSelectors = jQuery('input.column-selector-list-item');
                var fields = me.model.getFields();
                var newFields = [];
                for (var j=0; j<fields.length; j++) {
                    for (var k=0; k<fieldSelectors.length; k++) {
                        if (fields[j] === fieldSelectors[k].id) {
                            if (fieldSelectors[k].checked) {
                                newFields.push(fields[j]);
                            }
                            break;
                        }
                    }
                }
                if (newFields.length>0) {
                    me.setVisibleFields(newFields);
                }
                me.renderTo(me.visibleColumnSelector.parent(), {columnSelector: 'open'});
            });
            columnSelectorList.append(newColumn);
        }
        columnSelectorList.attr('class', 'column-selector-list');
        columnSelector.append(columnSelectorList, columnSelectorClose);
        columnSelectorClose.click(function(e){
            e.stopPropagation();
            columnSelector.css('visibility', 'hidden');
        });
    },

    /**
     * @method _enableColumnResizer
     * Enables column resizing functionality
     */
    _enableColumnResizer: function() {
        var pressed = false;
        var start = undefined;
        var startX, startWidth;

        var featureTable = jQuery('table.oskari-grid th');
        featureTable.css('cursor','e-resize');

        // Start resizing
        featureTable.mousedown(function(e) {
            start = jQuery(this);
            pressed = true;
            startX = e.pageX;
            startWidth = jQuery(this).width();
            jQuery(start).addClass("resizing");
            // Disable mouse selecting
            jQuery(document).attr('unselectable', 'on')
                .css('user-select', 'none')
                .on('selectstart', false);
        });

        // Resize when mouse moves
        jQuery(document).mousemove(function(e) {
            if(pressed) {
                jQuery(start).width(startWidth+(e.pageX-startX));
            }
        });

        // Stop resizing
        jQuery(document).mouseup(function() {
            if(pressed) {
                jQuery(start).removeClass("resizing");
                pressed = false;
            }
        });
    },

    /**
     * @method renderTo
     * Renders the data in #getDataModel() to the given DOM element.
     * @param {jQuery} container reference to DOM element where the grid should be inserted.
     * @param {Object} state tells into what state we are going to render this grid
     * (e.g. columnSelector: open tells that we want to show columnselector)
     */
    renderTo: function(container, state) {
        container.empty();
        var fieldNames = this.fieldNames;
        // if visible fields not given, show all
        if(fieldNames.length == 0) {
            fieldNames = this.model.getFields();
        }

        var table = this.template.clone();
        this.table = table;
        this._renderHeader(table, fieldNames);

        if(this.lastSort) {
            // sort with last know sort when updating data
            this._sortBy(this.lastSort.attr, this.lastSort.descending);
        }
        this._renderBody(table, fieldNames);

        if (this.showColumnSelector) {
            this._renderColumnSelector(table, fieldNames);
            container.append(this.visibleColumnSelector);
            if(state != null && state.columnSelector == 'open') {
                this.visibleColumnSelector.find('.column-selector').css('visibility', 'visible');
            }
        }

        container.append(table);

        if (this.resizableColumns) this._enableColumnResizer();
   },
    /**
     * @method _dataSelected
     * Notifies all selection listeners about selected data.
     * @private
     * @param {String} dataId id for the selected data
     */
    _dataSelected : function(dataId) {
        for(var i = 0; i < this.selectionListeners.length; i++) {
            this.selectionListeners[i](this, dataId);
        }
    },

    /**
     * @method select
     * Tries to find an object from #getDataModel() using the the id given as parameter "value".
     * Oskari.mapframework.bundle.featuredata.domain.GridModel.getIdField() is used to determine
     * the field which value is compared against.
     * If found, selects the corresponding row in the grid.
     * @param {String} value id for the data to be selected
     * @param {Boolean} keepPrevious true to keep previous selection, false to clear before selecting
     */
    select : function(value, keepPrevious) {
        var key = this.model.getIdField();
        var dataArray = this.model.getData();
        var index = 0;
        for(; index < dataArray.length; ++index) {
            var data =  dataArray[index];
            if(data[key] == value) {
                // found
                break;
            }
        }
        var rows = this.table.find('tbody tr');
        if(keepPrevious != true) {
            rows.removeClass('selected');
        }
        jQuery(rows[index]).addClass('selected');
    },

    /**
     * @method removeSelections
     */
    removeSelections : function() {
        var rows = this.table.find('tbody tr');
        rows.removeClass('selected');
    },

    /**
     * @method getSelection
     * Returns current selection visible on grid.
     * @return {Object[]} subset of #getDataModel() that is currently selected in grid
     */
    getSelection : function() {
        var dataArray = this.model.getData();
        var selection = [];
        var rows = this.table.find('tbody tr');
        for(var i = 0; i < rows.length; ++i) {
            var row = jQuery(rows[i]);
            if(row.hasClass('selected')) {
                selection.push(dataArray[i]);
            }
        }
        return selection;
    },

    /**
     * @method getTable
     * Returns the grid table.
     * @return {Object} table for the grid data
     */
    getTable : function() {
      return this.table;
    },

    /**
     * @method _sortBy
     * Sorts the last search result by comparing given attribute on the search objects
     * @private
     * @param {String} pAttribute attributename to sort by (e.g. result[pAttribute])
     * @param {Boolean} pDescending true if sort direction is descending
     */
    _sortBy : function(pAttribute, pDescending) {
      var me = this;
      var dataArray = this.model.getData();
      if(dataArray.length == 0) {
          return;
      }
      this.lastSort = {
          attr : pAttribute,
          descending : pDescending
      };
      dataArray.sort(function(a,b) {
            return me._sortComparator(a,b,pAttribute, pDescending);
      });

    },

    /**
     * @method _sortComparator
     * Compares the given attribute on given objects for sorting search result objects.
     * @private
     * @param {Object} a search result 1
     * @param {Object} b search result 2
     * @param {String} pAttribute attributename to sort by (e.g. a[pAttribute])
     * @param {Boolean} pDescending true if sort direction is descending
     */
    _sortComparator : function(a, b, pAttribute, pDescending) {

        if(typeof a[pAttribute] === 'object' ||
           typeof b[pAttribute] === 'object') {
           // not sorting objects
            return 0;
        }
        // to string so number will work also
        var nameA = a[pAttribute];
        if(!nameA) {
            nameA = '';
        }
        else if(nameA.toLowerCase) {
            nameA = nameA.toLowerCase();
        }
        var nameB = b[pAttribute];
        if(!nameB) {
            nameB = '';
        }
        else if(nameB.toLowerCase) {
            nameB = nameB.toLowerCase();
        }

        var value = 0;

        if (nameA < nameB) {
            value = -1;
        }
        else if (nameA > nameB) {
            value = 1;
        }
        if(pDescending) {
            value = value * -1;
        }
        return value;
    }
});
