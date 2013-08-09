/**
 * @class Oskari.mapframework.bundle.publisher.view.BasicPublisher
 * Renders the publishers "publish mode" sidebar view where the user can make 
 * selections regarading the map to publish.
 */
Oskari.clazz.define('Oskari.mapframework.bundle.publisher.view.BasicPublisher',

/**
 * @method create called automatically on construction
 * @static
 * @param {Oskari.mapframework.bundle.publisher.PublisherBundleInstance} instance
 * 		reference to component that created this view
 * @param {Object} localization
 *      localization data in JSON format
 */


function(instance, localization, data) {

   this.data = data;

   var me = this;

    this.instance = instance;
    this.template = jQuery('<div class="basic_publisher">' + 
    	                   '<div class="header">' + 
                           '<div class="icon-close">' + 
                           '</div>' + 
                           '<h3></h3>' + 
                           '</div>' +
    	'<div class="content">' +   
    	'</div>' +
    '</div>');

    me.templates = {
        "publishedGridTemplate": '<div class="publishedgrid"></div>'
    }

    this.templateButtonsDiv = jQuery('<div class="buttons"></div>');
    this.templateHelp = jQuery('<div class="help icon-info"></div>');
    this.templateTool = jQuery('<div class="tool ">' + '<input type="checkbox"/>' + '<span></span></div>');
    this.templateData = jQuery('<div class="data ">' + '<input type="checkbox"/>' + '<label></label></div>');
    this.templateSizeOptionTool = jQuery('<div class="tool ">' + '<input type="radio" name="size" />' + '<span></span></div>');
    this.templateCustomSize = jQuery('<div class="customsize">' + '<input type="text" name="width" ' + 
            'placeholder="' + localization.sizes.width + '"/> x ' + 
            '<input type="text" name="height" placeholder="' + localization.sizes.height + '"/></div>');

   /* /**
     * @property tools
     */
    this.tools = [{
        id : 'Oskari.mapframework.bundle.mapmodule.plugin.ScaleBarPlugin',
        selected : false
    }, {
        id : 'Oskari.mapframework.bundle.mapmodule.plugin.IndexMapPlugin',
        selected : false
    }, {
        id : 'Oskari.mapframework.bundle.mapmodule.plugin.PanButtons',
        selected : false,
        config : {
            location: {
                top : '10px',
                left : '10px'
            }
        }
    }, {
        id : 'Oskari.mapframework.bundle.mapmodule.plugin.Portti2Zoombar',
        selected : true,
        config : {
            location : {
                top : '10px',
                left : '10px'
            }
        }
    }, {
        id : 'Oskari.mapframework.bundle.mapmodule.plugin.SearchPlugin',
        selected : false
    }, {
        id : 'Oskari.mapframework.mapmodule.ControlsPlugin',
        selected : true
    }, {
        id : 'Oskari.mapframework.mapmodule.GetInfoPlugin',
        selected : true
    }];


    this.sizeOptions = [{
        id : 'small',
        width : 580,
        height : 387
    }, {
        id : 'medium',
        width : 700,
        height : 525,
        selected : true // default option
    }, {
        id : 'large',
        width : 1240,
        height : 700
    }, {
        id : 'custom',
        //width : 'max 4000',
        //height : 2000,
        minWidth : 30,
        minHeight : 20,
        maxWidth : 4000,
        maxHeight : 2000
    }];

    this.grid = {};
    this.grid.selected = true;

    if(data) {
        if(data.lang) {
            Oskari.setLang(data.lang);
        }
        // setup initial size
        var sizeIsSet = false;
        var initWidth = this.data.state.mapfull.config.size.width;
        var initHeight = this.data.state.mapfull.config.size.height;
        for (var i = 0; i< this.sizeOptions.length; ++i) {
            var option = this.sizeOptions[i];
            if(initWidth === option.width && initHeight == option.height) {
                option.selected = true;
                sizeIsSet = true;
            }
            else {
                option.selected = false;
            }
        }
        if (!sizeIsSet) {
            var customSizeOption = this.sizeOptions[this.sizeOptions.length -1];
            customSizeOption.selected = true;
            customSizeOption.width = initWidth;
            customSizeOption.height = initHeight;
        }

        // setup initial plugins
        var plugins = this.data.state.mapfull.config.plugins;
        this.data.hasLayerSelectionPlugin = false;
        for (var i = 0; i< this.tools.length; ++i) {
            var option = this.tools[i];
            for (var j = 0; j< plugins.length; ++j) {
                var plugin = plugins[j];
                if(option.id == plugin.id) {
                    option.selected = true;
                    break;
                }
                else {
                    option.selected = false;
                }
                if(plugin.id == 'Oskari.mapframework.bundle.mapmodule.plugin.LayerSelectionPlugin') {
                    this.data.hasLayerSelectionPlugin = plugin.config;
                }
            }
        }
    }

    this.loc = localization;
    this.accordion = null;

    this.maplayerPanel = null;
    this.mainPanel = null;
    this.normalMapPlugins = [];
    this.logoPlugin = Oskari.clazz.create('Oskari.mapframework.bundle.mapmodule.plugin.LogoPlugin');
    this.latestGFI = null;
}, {
    /**
     * @method render
     * Renders view to given DOM element
     * @param {jQuery} container reference to DOM element this component will be
     * rendered to
     */
    render : function(container) {
        var me = this;
        var content = this.template.clone();

        this.mainPanel = content;

        container.append(content);
        var contentDiv = content.find('div.content');

        var accordion = Oskari.clazz.create('Oskari.userinterface.component.Accordion');
        this.accordion = accordion;
        
        var form = Oskari.clazz.create('Oskari.mapframework.bundle.publisher.view.PublisherLocationForm',this.loc, this);
        this.locationForm = form;
        if(this.data) {
            content.find('div.header h3').append(this.loc.titleEdit);
            form.init({
                "domain": this.data.domain, 
                "name": this.data.name, 
                "lang": this.data.lang
            });
        }
        else {
            content.find('div.header h3').append(this.loc.title);
            form.init();
        }
        
        var panel = form.getPanel();
        panel.open();
        accordion.addPanel(panel);
        
        // add grid checkbox
        var sandbox = this.instance.getSandbox();
        var selectedLayers = sandbox.findAllSelectedMapLayers();
        var showStats = false;
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            if(layer.getLayerType() === "stats") {
                showStats = true;
            }
        };
        if(showStats) {
            // Find the map module.
            var mapModule = sandbox.findRegisteredModuleInstance('MainMapModule');
            me.mapModule = mapModule;

            // The container where the grid will be rendered to.
            var container = jQuery(me.templates.publishedGridTemplate);
            me.statsContainer = container;

            var dataPanel = this._createDataPanel();
            dataPanel.open();
            accordion.addPanel(dataPanel);
        }


        accordion.addPanel(this._createSizePanel());
        accordion.addPanel(this._createToolsPanel());

        this.maplayerPanel = Oskari.clazz.create('Oskari.mapframework.bundle.publisher.view.PublisherLayerForm', this.loc, this.instance);
        this.maplayerPanel.init();
        
        accordion.addPanel(this.maplayerPanel.getPanel());
        accordion.insertTo(contentDiv);


        // buttons
        // close
        container.find('div.header div.icon-close').bind('click', function() {
        	me.instance.setPublishMode(false);
        });
        contentDiv.append(this._getButtons());
        
        var inputs = this.mainPanel.find('input[type=text]');
        inputs.focus(function(){
            me.instance.sandbox.postRequestByName('DisableMapKeyboardMovementRequest');
        });
        inputs.blur(function(){
            me.instance.sandbox.postRequestByName('EnableMapKeyboardMovementRequest');
        });
        
        // bind help tags
        var helper = Oskari.clazz.create('Oskari.userinterface.component.UIHelper', this.instance.sandbox);
        helper.processHelpLinks(this.loc.help, content, this.loc.error.title, this.loc.error.nohelp);

    },
    /**
     * @method _setSelectedSize
     * @private
     * Adjusts the map size according to publisher selection
     */
    _setSelectedSize : function() {
        var me = this;
        var widthInput = this.mainPanel.find('div.customsize input[name=width]');
        widthInput.removeClass('error');
        var heightInput = this.mainPanel.find('div.customsize input[name=height]');
        heightInput.removeClass('error');
        var mapModule = this.instance.sandbox.findRegisteredModuleInstance('MainMapModule');
        for (var i = 0; i < me.sizeOptions.length; ++i) {
            var option = me.sizeOptions[i];
            if (option.selected) {
            	// reference to openlayers map.div
                var mapElement = jQuery(mapModule.getMap().div);
                if (option.id == "custom") {
                    var width = widthInput.val();
                    if (this._validateNumberRange(width, option.minWidth, option.maxWidth)) {
                        mapElement.width(width);
                        me.adjustDataContainer();
                    } else {
                        widthInput.addClass('error');
                    }
                    var height = heightInput.val();
                    if (this._validateNumberRange(height, option.minHeight, option.maxHeight)) {
                        mapElement.height(height);
                    } else {
                        heightInput.addClass('error');
                    }
                    break;
                } else {
                    mapElement.width(option.width);
                    mapElement.height(option.height);
                    me.adjustDataContainer();
                }
                break;
            }
        }
        // notify openlayers that size has changed
        mapModule.updateSize();
    },
    /**
     * @method _createSizePanel
     * @private
     * Creates the size selection panel for publisher
     * @return {jQuery} Returns the created panel
     */
    _createSizePanel : function() {
        var me = this;
        var panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
        panel.setTitle(this.loc.size.label);
        var contentPanel = panel.getContainer();
        // tooltip
        var tooltipCont = this.templateHelp.clone();
        tooltipCont.attr('title', this.loc.size.tooltip);
        contentPanel.append(tooltipCont);
        // content
        var closureMagic = function(tool) {
            return function() {
                var size = contentPanel.find('input[name=size]:checked').val();
                // reset previous setting
                for (var i = 0; i < me.sizeOptions.length; ++i) {
                    me.sizeOptions[i].selected = false;
                }
                tool.selected = true;
                me._setSelectedSize();
            };
        };
        var initCustomSize = false;
        for (var i = 0; i < this.sizeOptions.length; ++i) {
            var option = this.sizeOptions[i];
            var toolContainer = this.templateSizeOptionTool.clone();
            var label = this.loc.sizes[option.id];
            if(option.width && option.height && "custom" != option.id) {
                label = me._getSizeLabel(label, option);
            }
            toolContainer.find('span').addClass('sizeoption_' + option.id).append(label);
            if (option.selected) {
                toolContainer.find('input').attr('checked', 'checked');
                if("custom" == option.id) {
                    initCustomSize = true;
                }
            }
            contentPanel.append(toolContainer);
            toolContainer.find('input').attr('value', option.id);
            toolContainer.find('input').change(closureMagic(option));
        }
        var customSizes = this.templateCustomSize.clone();
        var inputs = customSizes.find('input');
        inputs.focus(function(){
            var radio = contentPanel.find('input[name=size][value=custom]');
            radio.attr('checked', 'checked');
            radio.trigger('change');
        });
        inputs.bind('keyup', function() {
            me._setSelectedSize();
        });
        if(initCustomSize) {
            var widthInput = customSizes.find('input[name=width]');
            widthInput.val(option.width);
            var heightInput = customSizes.find('input[name=height]');
            heightInput.val(option.height);
        }

        contentPanel.append(customSizes);

        return panel;
    },
    /**
     * Gets the label text for a size option. It changes based on grid visibility.
     *
     * @method _getSizeLabel
     * @private
     */
    _getSizeLabel: function(label, option) {
        var gridWidth = ( this.isDataVisible ? this._calculateGridWidth() : 0 );
        return (label + ' (' + (option.width + gridWidth) + ' x ' + option.height + 'px)');
    },
    /**
     * Sets the size label in size accordion panel in UI.
     *
     * @method _setSizeLabels
     * @private
     */
    _setSizeLabels: function() {
        for (var i = 0; i < this.sizeOptions.length; ++i) {
            var option = this.sizeOptions[i];
            var span = jQuery('span.sizeoption_' + option.id);
            var label = this.loc.sizes[option.id];
            if(option.width && option.height && "custom" != option.id) {
                label = this._getSizeLabel(label, option);
            }
            span.text(label);
        }
    },
    /**
     * @method _createToolsPanel
     * @private
     * Creates the tool selection panel for publisher
     * @return {jQuery} Returns the created panel
     */
    _createToolsPanel : function() {
        var me = this;
        var panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
        panel.setTitle(this.loc.tools.label);
        var contentPanel = panel.getContainer();
        // tooltip
        var tooltipCont = this.templateHelp.clone();
        tooltipCont.attr('title', this.loc.tools.tooltip);
        contentPanel.append(tooltipCont);

        // content
        var closureMagic = function(tool) {
            return function() {
                var checkbox = jQuery(this);
                var isChecked = checkbox.is(':checked');
                tool.selected = isChecked;
                me._activatePreviewPlugin(tool, isChecked);
            };
        };
        
        for (var i = 0; i < this.tools.length; ++i) {
            var toolContainer = this.templateTool.clone();
            var pluginKey = this.tools[i].id;
            pluginKey = pluginKey.substring(pluginKey.lastIndexOf('.') + 1);
            var toolname = this.loc.tools[pluginKey];
            toolContainer.find('span').append(toolname);
            if (this.tools[i].selected) {
                toolContainer.find('input').attr('checked', 'checked');
            }
            contentPanel.append(toolContainer);
            toolContainer.find('input').change(closureMagic(this.tools[i]));
        }

        return panel;
    },
    _createDataPanel : function() {
        var me = this;
        var panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
        panel.setTitle(this.loc.data.label);
        var contentPanel = panel.getContainer();
        // tooltip
        var tooltipCont = this.templateHelp.clone();
        tooltipCont.attr('title', this.loc.data.tooltip);
        contentPanel.append(tooltipCont);

        var dataContainer = this.templateData.clone();
        dataContainer.find('input').attr('id', 'show-grid-checkbox').change(function() {
            var checkbox = jQuery(this);
            var isChecked = checkbox.is(':checked');
            me.isDataVisible = isChecked;
            me.adjustDataContainer();
            // Update the size labels
            me._setSizeLabels();
        });
        dataContainer.find('label').attr('for', 'show-grid-checkbox').append(this.loc.data.grid);

        if (this.grid.selected) {
            dataContainer.find('input').attr('checked', 'checked');
            me.isDataVisible = this.grid.selected;
            me.adjustDataContainer();
        }
        contentPanel.append(dataContainer);

        return panel;
    },
    adjustDataContainer: function() {
        if (!this.statsContainer) {
            return;
        }
        var me = this;
        var content         = jQuery('#contentMap'),
            contentWidth    = content.width(),
            marginWidth     =  content.css('margin-left').split('px')[0];
        var maxContentWidth = jQuery(window).width() - marginWidth - 40;

        var mapWidth    = jQuery('#mapdiv').width(),
            mapHeight   = jQuery('#mapdiv').height();

        // how many columns * 80px
        var gridWidth   = this._calculateGridWidth();//maxContentWidth - mapWidth;
        var gridHeight  = mapHeight; 

        var elLeft      = jQuery('.oskariui-left');
        var elCenter    = jQuery('.oskariui-center');

        if(this.isDataVisible) {
            if(gridWidth > 400) {
                gridWidth = 400;
            }
            elLeft.removeClass('oskari-closed');
            jQuery('#contentMap').width(gridWidth + mapWidth);

            gridWidth = gridWidth+'px';
            gridHeight = gridHeight +'px';
            mapWidth = mapWidth+'px';
        } else {
            elLeft.addClass('oskari-closed');
            jQuery('#contentMap').width('');

            gridWidth = '0px';
            gridHeight = '0px';
            contentWidth = '100%';
        }
        elLeft.css({'width': gridWidth, 'height': gridHeight, 'float': 'left'}).addClass('published-grid-left');
        elCenter.css({'width': mapWidth, 'float': 'left'}).addClass('published-grid-center');
        this.statsContainer.height(mapHeight);

        if(this.gridPlugin){
            this.gridPlugin.setGridHeight();
        }
    },
    _calculateGridWidth: function() {
        var me = this,
            sandbox = Oskari.getSandbox('sandbox'),
            width;
        // get state of statsgrid
        var statsGrid = sandbox.getStatefulComponents()['statsgrid'];
        if(statsGrid &&
            statsGrid.state &&
            statsGrid.state.indicators != null) {
            
            //indicators + municipality (name & code)
            var columns = statsGrid.state.indicators.length + 2;
            //slickgrid column width is 80 by default
            width = columns * 80;
        } else {
            width = 160;
        }
        // Width + scroll bar width.
        return (width + 20);
    },

    getDataContainer: function() {
        return jQuery('.oskariui-left');
    },
    addDataGrid: function(grid){
        this.getDataContainer.html(grid);
    },

    /**
     * @method handleMapMoved
     * Does nothing currently.
     */
    handleMapMoved : function() {

        var mapVO = this.instance.sandbox.getMap();
        var lon = mapVO.getX();
        var lat = mapVO.getY();
        var zoom = mapVO.getZoom();
        //this.mainPanel.find('div.locationdata').html('N: ' + lat + ' E: ' + lon + ' ' + this.loc.zoomlevel + ': ' + zoom);
    },
    /**
     * @method _activatePreviewPlugin
     * @private
     * Enables or disables a plugin on map
     * @param {Object} tool tool definition as in #tools property
     * @param {Boolean} enabled, true to enable plugin, false to disable
     */
    _activatePreviewPlugin : function(tool, enabled) {
        if (!tool.plugin && enabled) {
            var mapModule = this.instance.sandbox.findRegisteredModuleInstance('MainMapModule');
            tool.plugin = Oskari.clazz.create(tool.id, tool.config);
            mapModule.registerPlugin(tool.plugin);
        }
        if (!tool.plugin) {
            // plugin not created -> nothing to do
            return;
        }
        if (enabled) {
            tool.plugin.startPlugin(this.instance.sandbox);
            tool._isPluginStarted = true;
        } else {
        	if( tool._isPluginStarted ) {
        		tool._isPluginStarted = false;
            	tool.plugin.stopPlugin(this.instance.sandbox);
           } 
        }

        this._adjustMapNavigationLocation(tool, enabled);
    },
    /**
     * @method _getButtons
     * @private
     * Renders publisher buttons to DOM snippet and returns it.
     * @return {jQuery} container with buttons
     */
    _getButtons : function() {
        var me = this;
                
        var buttonCont = this.templateButtonsDiv.clone();
        
        var cancelBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
        cancelBtn.setTitle(this.loc.buttons.cancel);
        cancelBtn.setHandler(function() {
        	me.instance.setPublishMode(false);
        });
		cancelBtn.insertTo(buttonCont);
		
		
        var saveBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
        saveBtn.setTitle(this.loc.buttons.save);
        saveBtn.addClass('primary');
		
        if (this.data) {
            var save = function() {
                var selections = me._gatherSelections();
                if(selections) {
                    me._publishMap(selections);
                }
            };
            saveBtn.setTitle(this.loc.buttons.saveNew);
            saveBtn.setHandler(function() {
                me.data.id = null;
                delete me.data.id;
                save();
            });
            saveBtn.insertTo(buttonCont);

            var replaceBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            replaceBtn.setTitle(this.loc.buttons.replace);
            replaceBtn.addClass('primary');
            replaceBtn.setHandler(function() {
                me._showReplaceConfirm(save);
            });
            replaceBtn.insertTo(buttonCont);
            
        }
        else {
            saveBtn.setTitle(this.loc.buttons.save);
            saveBtn.setHandler(function() {
                var selections = me._gatherSelections();
                if(selections) {
                    me._publishMap(selections);
                }
            });
            saveBtn.insertTo(buttonCont);            
        }
		
        return buttonCont;
    },
    
    /**
     * @method _showReplaceConfirm
     * @private
     * Shows a confirm dialog for replacing published map
     * @param {Function} continueCallback function to call if the user confirms 
     */
    _showReplaceConfirm : function(continueCallback) {
        var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
        var okBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
        okBtn.setTitle(this.loc.buttons.replace);
        okBtn.addClass('primary');
        okBtn.setHandler(function() {
            dialog.close();
            continueCallback();
        });
        var cancelBtn = dialog.createCloseButton(this.loc.buttons.cancel);
        dialog.show(this.loc.confirm.replace.title, this.loc.confirm.replace.msg, [cancelBtn, okBtn]);
    },
    /**
     * @method _showValidationErrorMessage
     * @private
     * Takes an error array as defined by Oskari.userinterface.component.FormInput validate() and 
     * shows the errors on a  Oskari.userinterface.component.Popup
     * @param {Object[]} errors validation error objects to show 
     */
    _showValidationErrorMessage : function(errors) {
    	var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
    	var okBtn = dialog.createCloseButton(this.loc.buttons.ok);
    	var content = jQuery('<ul></ul>');
    	for(var i = 0 ; i < errors.length; ++i) {
    		var row = jQuery('<li></li>');
    		row.append(errors[i]['error'])
    		content.append(row);
    	}
    	dialog.show(this.loc['error'].title, content, [okBtn]);
    },
    /**
     * @method _gatherSelections
     * @private
     * Gathers publisher selections and returns them as JSON object
     * @return {Object}
     */
    _gatherSelections : function() {
        var container = this.mainPanel;
        var sandbox = this.instance.getSandbox();
        
        var errors = this.locationForm.validate();
        var values = this.locationForm.getValues();
        var size = container.find('input[name=size]:checked').val();
        var gridWidth = this._calculateGridWidth();
        var selections = {
            domain : values.domain,
            name : values.name,
            language : values.language,
            plugins : []
        };

        if (this.data && this.data.id) {
            selections.id = this.data.id;
        }

        for (var i = 0; i < this.tools.length; ++i) {
            if (this.tools[i].selected) {
            	var tmpTool = {
                    id : this.tools[i].id
                };
                if(this.tools[i].config) {
                	tmpTool.config = this.tools[i].config; 
                } 
            	
                selections.plugins.push(tmpTool);
            }
        }
        if (size == 'custom') {

            var width = container.find('div.customsize input[name=width]').val();
            var height = container.find('div.customsize input[name=height]').val();
            if (this._validateSize(width, height)) {
                selections.size = {
                    width : width,
                    height : height
                };
            } else {
            	errors.push({
            		field : 'size',
            		error : this.loc['error'].size
            	});
            }
        } else {

            for (var i = 0; i < this.sizeOptions.length; ++i) {
                var option = this.sizeOptions[i];
                if (option.id == size) {
                    selections.size = {
                        width : option.width,
                        height : option.height
                    };
                    break;
                }
            }
        }
        
        // if maplayer plugin is enabled
        var layerValues = this.maplayerPanel.getValues();
        if (layerValues.layerSelection) {
            selections.plugins.push(layerValues.layerSelection);
			selections.defaultBase = layerValues.defaultBase;
			selections.baseLayers = layerValues.baseLayers;
        }
        // if data grid is enabled
        if(this.isDataVisible) {
            // get state of statsgrid
            var statsGrid = this.sandbox.getStatefulComponents()['statsgrid'];
            selections.gridState = statsGrid.state;
        }
        
        var mapFullState = sandbox.getStatefulComponents()['mapfull'].getState();
        selections.mapstate = mapFullState;
        
        
        // saves possible open gfi popups
        if (sandbox.getStatefulComponents()['infobox']) {
            selections["infobox"] = sandbox.getStatefulComponents()['infobox'].getState();
        }
        
        if(errors.length > 0) {
        	// TODO: messages
        	this._showValidationErrorMessage(errors);
        	return;
        }
        return selections;

    },

    /**
     * Adjust the location of the zoombar in case the panbuttons tool is selected.
     *
     * @method _adjustMapNavigationLocation
     * @private
     * @param {Object} tool
     * @param {Boolean} enabled
     */
    _adjustMapNavigationLocation: function(tool, enabled) {
        var zoomBar, panButtons, zoombarLocation;
        var locationBoth = {
            top: '110px',
            left: '45px'
        };
        var locationOne = {
            top: '10px',
            left: '10px'
        };
        // Find the zoombar and panbuttons tools.
        for (var i = 0; i < this.tools.length; ++i) {
            if (this.tools[i].id === 'Oskari.mapframework.bundle.mapmodule.plugin.Portti2Zoombar') {
                zoomBar = this.tools[i];
            }
            if (this.tools[i].id === 'Oskari.mapframework.bundle.mapmodule.plugin.PanButtons') {
                panButtons = this.tools[i];
            }
        }
        
        // Zoombar added
        if (tool.id === zoomBar.id) {
            if (panButtons._isPluginStarted) {
                // Panbuttons visible
                zoombarLocation = locationBoth;
            } else {
                zoombarLocation = locationOne;
            }
        }
        // Panbuttons added
        else if (tool.id === panButtons.id) {
            if (enabled) {
                zoombarLocation = locationBoth;
            } else {
                zoombarLocation = locationOne;
            }
        }
        else {
            return;
        }

        if (zoomBar._isPluginStarted) {
            zoomBar.config.location = zoombarLocation;
            zoomBar.plugin.setZoombarLocation(zoombarLocation);
        }
    },

    /**
     * @method _publishMap
     * @private
     * Sends the gathered map data to the server to save them/publish the map.
     * @param {Object} selections map data as returned by _gatherSelections()
     */
    _publishMap : function(selections) {
    	var me = this;
        var sandbox = this.instance.getSandbox();
        var url = sandbox.getAjaxUrl();
        // Total width for map and grid. Used to calculate the iframe size.
        var totalWidth = ( me.isDataVisible ?
            (selections.size.width + me._calculateGridWidth()) :
            selections.size.width );
		var errorHandler = function() {
	    	var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
	    	var okBtn = dialog.createCloseButton(me.loc.buttons.ok);
	    	dialog.show(me.loc['error'].title, me.loc['error'].saveFailed, [okBtn]);
        };
        
        // make the ajax call
        jQuery.ajax({
            url : url + '&action_route=Publish',
            type : 'POST',
            dataType : "json",
            data : {
                pubdata : JSON.stringify(selections)
            },
            beforeSend : function(x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success : function(response) {
            	if(response.id > 0) {
			        var event = sandbox.getEventBuilder('Publisher.MapPublishedEvent')(response.id,
			        	totalWidth, selections.size.height, selections.language);
			        sandbox.notifyAll(event);
            	}
            	else {
        			errorHandler();
            	}
            },
            error : errorHandler
        });
    },
    /**
     * @method _validateNumberRange
     * @private
     * @param {Object} value number to validate
     * @param {Number} min min value
     * @param {Number} max max value
     * Validates number range
     */
    _validateNumberRange : function(value, min, max) {
        if (isNaN(parseInt(value))) {
            return false;
        }
        if (!isFinite(value)) {
            return false;
        }
        if (value < min || value > max) {
            return false;
        }
        return true;
    },
    /**
     * @method _validateSize
     * @private
     * @param {Number} width value from width field
     * @param {Number} height value from height field
     * Validates size for custom size option
     */
    _validateSize : function(width, height) {
        var custom = null;
        for (var i = 0; i < this.sizeOptions.length; ++i) {
            var option = this.sizeOptions[i];
            if (option.id == 'custom') {
                custom = option;
                break;
            }
        }
        var isOk = this._validateNumberRange(width, custom.minWidth, custom.maxWidth) && this._validateNumberRange(height, custom.minHeight, custom.maxHeight);
        return isOk;
    },
    /**
     * @method _enablePreview
     * @private
     * Modifies the main map to show what the published map would look like
     */
    _enablePreview : function() {
        var me = this;
        var mapModule = this.instance.sandbox.findRegisteredModuleInstance('MainMapModule');
        var plugins = mapModule.getPluginInstances();

        for (var p in plugins) {
            var plugin = plugins[p];
            if (plugin.hasUI && plugin.hasUI()) {
                plugin.stopPlugin(me.instance.sandbox);
                mapModule.unregisterPlugin(plugin);
                this.normalMapPlugins.push(plugin);
            }
        }

        this.maplayerPanel.start();
        if(this.data && this.data.hasLayerSelectionPlugin) {
            // sets up initial data when editing published map
            this.maplayerPanel.useConfig(this.data.hasLayerSelectionPlugin);
        }

        this._setSelectedSize();

        for (var i = 0; i < this.tools.length; ++i) {
            if (this.tools[i].selected) {
                this._activatePreviewPlugin(this.tools[i], true);
            }
        }

        mapModule.registerPlugin(this.logoPlugin);
        this.logoPlugin.startPlugin(me.instance.sandbox);
    },
    /**
     * @method _disablePreview
     * @private
     * Returns the main map from preview to normal state
     */
    _disablePreview : function() {
        var me = this;
        var mapModule = this.instance.sandbox.findRegisteredModuleInstance('MainMapModule');
        var plugins = mapModule.getPluginInstances();
        // teardown preview plugins
        for (var i = 0; i < this.tools.length; ++i) {
            if (this.tools[i].plugin) {
                this._activatePreviewPlugin(this.tools[i], false);
                mapModule.unregisterPlugin(this.tools[i].plugin);
                this.tools[i].plugin = undefined;
                delete this.tools[i].plugin;
            }
        }
        this.maplayerPanel.stop();

        // return map size to normal
        var mapElement = jQuery(mapModule.getMap().div);
        // remove width definition to resume size correctly
        mapElement.width('');
        mapElement.height(jQuery(window).height());
        
        // notify openlayers that size has changed
        mapModule.updateSize();

        // resume normal plugins
        for (var i = 0; i < this.normalMapPlugins.length; ++i) {
            var plugin = this.normalMapPlugins[i];
            mapModule.registerPlugin(plugin);
            plugin.startPlugin(me.instance.sandbox);
        }
        // reset listing
        this.normalMapPlugins = [];

        mapModule.unregisterPlugin(this.logoPlugin);
        this.logoPlugin.stopPlugin(me.instance.sandbox);
    },
    /**
     * @method setEnabled
     * "Activates" the published map preview when enabled
     * and returns to normal mode on disable
     * @param {Boolean} isEnabled true to enable preview, false to disable
     * preview
     */
    setEnabled : function(isEnabled) {
        if (isEnabled) {
            this._enablePreview();
        } else {
            this._disablePreview();
        }
    },
    /**
     * @method destroy
     * Destroyes/removes this view from the screen.
     */
    destroy : function() {
    	this.mainPanel.remove();
    },
    /**
     * @method setPluginLanguage
     * Changes system language with Oskari.setLang and stops/starts plugins to make 
     * them rewrite their UI with the new language.
     * @param {String} lang language code
     */
    setPluginLanguage : function(lang) {
        Oskari.setLang(lang);

        for (var i = 0; i < this.tools.length; ++i) {
            var tool = this.tools[i];
            if(tool._isPluginStarted) {
                // stop and start if enabled to change language
                this._activatePreviewPlugin(tool, false);
                this._activatePreviewPlugin(tool, true);
            }
        }
        // stop and start if enabled to change language
        this._resetLayerSelectionPlugin();
        
        // stop and start if enabled to change language
        this.logoPlugin.stopPlugin(this.instance.sandbox);
        this.logoPlugin.startPlugin(this.instance.sandbox);
    },
    /**
     * @method _resetLayerSelectionPlugin
     * Changes system language with Oskari.setLang and stops/starts plugins to make 
     * them rewrite their UI with the new language.
     * @param {String} lang language code
     * @private
     */
    _resetLayerSelectionPlugin : function() {
        // stop and start if enabled to change language
        if(this.maplayerPanel.isEnabled()) {
            var values = this.maplayerPanel.plugin.getBaseLayers();
            
            this.maplayerPanel.enablePlugin(false);
            this.maplayerPanel.enablePlugin(true);
            
            var baseLayers = values.baseLayers;
            var selectedBase = values.defaultBaseLayer;
            for (var i = 0; i < baseLayers.length; ++i) {
                var layer = this.instance.sandbox.findMapLayerFromSelectedMapLayers(baseLayers[i]);
                this.maplayerPanel.plugin.addBaseLayer(layer);
            }
            this.maplayerPanel.plugin.selectBaseLayer(selectedBase);
        }
    },

    initGrid: function(layer) {

        var me = this;
        var conf = me.conf;
        var locale = Oskari.getLocalization('StatsGrid'); // Let's use statsgrid's locale files.
        var showGrid = true;//me.conf ? me.conf.gridShown : true; // Show the grid on startup, defaults to true.
        var sandboxName = 'sandbox' ;
        var sandbox = Oskari.getSandbox(sandboxName);
        me.sandbox = sandbox;
        sandbox.register(me.instance);


        // Create the StatisticsService for handling ajax calls and common functionality.
        // Used in both plugins below.
        var statsService = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.StatisticsService', me);
        sandbox.registerService(statsService);
        me.statsService = statsService;

        // Fetch the state of the statsgrid bundle and create the UI based on it.
        // TODO: get the saved state from the published map.
        var statsGrid = me.sandbox.getStatefulComponents()['statsgrid'];
        if(statsGrid && statsGrid.state && showGrid) {
            //me.createUI(statsGrid.state);
            //me.publisher.

            // Register grid plugin to the map.
            var gridConf = {
                'published': true,
                'layer': layer,
                'state': statsGrid.state
            };
            var gridPlugin = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.plugin.ManageStatsPlugin', gridConf, locale);
            me.mapModule.registerPlugin(gridPlugin);
            me.mapModule.startPlugin(gridPlugin);
            me.gridPlugin = gridPlugin;

            // Register classification plugin to the map.
            var classifyPlugin = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.plugin.ManageClassificationPlugin', conf ,locale);
            me.mapModule.registerPlugin(classifyPlugin);
            me.mapModule.startPlugin(classifyPlugin);
            me.classifyPlugin = classifyPlugin;

            var elLeft = me.getDataContainer();
            elLeft.html(me.statsContainer);

            // Initialize the grid
            me.gridPlugin.createStatsOut(me.statsContainer);

        }
    }
});
