/**
 * @class Oskari.harava.bundle.mapmodule.plugin.HaravaDrawSearchGeometryPlugin
 */
Oskari.clazz.define('Oskari.harava.bundle.mapmodule.plugin.HaravaDrawSearchGeometryPlugin',

/**
 * @method create called automatically on construction
 * @static
 */
function(locale) {
    this.mapModule = null;
    this.pluginName = null;
    this._sandbox = null;
    this._map = null;
    this.enabled = true;
    this._searchLayer = null;
    this._oldSearchLayer = null;
    this.searchControls = null;
    this.currentSearchMode = null;
    this._locale = locale;
    
    this._pendingAjaxQuery = {
    	busy: false,
    	jqhr: null,
    	timestamp: null
    };
    
    this.featureStyle = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style(
            {
                pointRadius: 8,
                strokeColor: "#1C7372",
                fillColor: "#1C7372",
                fillOpacity: 0.3,
                strokeOpacity: 0.4,
                strokeWidth: 3
        })
    });
}, {
    /** @static @property __name plugin name */
    __name : 'HaravaDrawSearchGeometryPlugin',

    /**
     * @method getName
     * @return {String} plugin name
     */
    getName : function() {
        return this.pluginName;
    },
    /**
     * @method getMapModule
     * @return {Oskari.mapframework.ui.module.common.MapModule}
     * reference to map
     * module
     */
    getMapModule : function() {
        return this.mapModule;
    },
    /**
     * @method setMapModule
     * @param {Oskari.mapframework.ui.module.common.MapModule}
     * reference to map
     * module
     */
    setMapModule : function(mapModule) {
        this.mapModule = mapModule;
        if (mapModule) {
            this.pluginName = mapModule.getName() + this.__name;
        }
    },
    /**
     * @method hasUI
     * @return {Boolean} true
     * This plugin has an UI so always returns true
     */
    hasUI : function() {
        return true;
    },
    /**
     * @method init
     *
     * Interface method for the module protocol
     *
     * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
     *          reference to application sandbox
     */
    init : function(sandbox) {
        var me = this;
        this._sandbox = sandbox;
        this._sandbox.printDebug("[HaravaDrawSearchGeometryPlugin] init");
        
    	me._searchLayer = new OpenLayers.Layer.Vector("Harava search geometry layer", {
    		eventListeners : {
                "featuresadded" : function(layer) {
                	// send an event that the drawing has been completed
                    me.finishedDrawing();
                }
            },
            styleMap: this.featureStyle
    	});
    	me._oldSearchLayer = new OpenLayers.Layer.Vector("Harava old search geometry layer", {
    		styleMap: this.featureStyle
    	});
    	me._map.addLayers([me._searchLayer,me._oldSearchLayer]);
    	
    	this.searchControls = {
            point: new OpenLayers.Control.DrawFeature(me._searchLayer,
                        OpenLayers.Handler.Point),
            line: new OpenLayers.Control.DrawFeature(me._searchLayer,
                        OpenLayers.Handler.Path),
            regularPolygon: new OpenLayers.Control.DrawFeature(me._searchLayer,
                                OpenLayers.Handler.RegularPolygon),
            polygon: new OpenLayers.Control.DrawFeature(me._searchLayer,
                        OpenLayers.Handler.Polygon),
        };
    	
    	this.searchControls.regularPolygon.handler.setOptions({irregular: true});
    	
    	jQuery('#searchbygeom').append('<div class="search-by-geometry">'
    			+ '<div id="searchbygeom-point" class="searchbygeom-tool searchbygeom-point" title="'+this._locale.tooltips.searchByPoint+'"></div>'
    			//+ '<div id="searchbygeom-line" class="searchbygeom-tool searchbygeom-line" title="'+this._locale.tooltips.searchByLine+'"></div>'
    			+ '<div id="searchbygeom-mapextent" class="searchbygeom-tool searchbygeom-mapextent" title="'+this._locale.tooltips.searchByMapExtent+'"></div>'
    			+ '<div id="searchbygeom-regular-polygon" class="searchbygeom-tool searchbygeom-regular-polygon" title="'+this._locale.tooltips.searchByRegularPolygon+'"></div>'
    			+ '<div id="searchbygeom-polygon" class="searchbygeom-tool searchbygeom-polygon" title="'+this._locale.tooltips.searchByPolygon+'"></div></div>');    	
    	
    	jQuery('.searchbygeom-tool').live('click', function(){
    		var id = this.id;
    		if(id!='searchbygeom-mapextent'){
    			jQuery('.searchbygeom-tool').removeClass('active');
    			jQuery(this).addClass('active');
    		}
    		
    		switch(id){
    			case 'searchbygeom-point':
    				me.toggleControl('point');
    				break;
    			case 'searchbygeom-mapextent':
    	        	var mapExtent = me._map.getExtent();
    	        	var mapExtentPolygon = 'POLYGON(('+mapExtent.left+' ' +mapExtent.top + ','+mapExtent.right+' ' +mapExtent.top + ','+mapExtent.right+' ' +mapExtent.bottom + ','+mapExtent.left+' ' +mapExtent.bottom + ','+mapExtent.left+' ' +mapExtent.top + '))';
    	        	me._handleSearchByGeom(mapExtentPolygon,'mapextent');
    	        	me._closeGfiInfo();
			    	me.removeAllDrawings();
			    	jQuery('#searchbygeom-mapextent').addClass('active');
			    	window.setTimeout(function(){
			    		jQuery('#searchbygeom-mapextent').removeClass('active');
			    	},200);
			    	
    				break;
    			/*case 'searchbygeom-line':
    				me.toggleControl('line'); 
    				break;*/
    			case 'searchbygeom-polygon':
    				me.toggleControl('polygon'); 
    				break;
    			case 'searchbygeom-regular-polygon':
    				me.toggleControl('regularPolygon');
    				break;
    		}
    	});
    	
    	
    	for(var key in me.searchControls) {
    		me._map.addControl(me.searchControls[key]);
        }
    	
    	// Do default tool selection
    	$('#searchbygeom-point').trigger('click');
    },
    /**
     * @method _handleSearchByGeom
     * Handle geometry area selection
     * @param {String} geom geometry string
     * @param {String} tool name, overrides currentSearchMode
     */
    _handleSearchByGeom : function(geom, tool) {
        var me = this;
        var type = this.currentSearchMode;
        if(tool!=null){
        	type=tool;
        }
        var dte = new Date();
        var dteMs = dte.getTime();
        
        if( me._pendingAjaxQuery.busy && me._pendingAjaxQuery.timestamp &&  
        	dteMs - me._pendingAjaxQuery.timestamp < 500 ) {
        	me._sandbox.printDebug("[HaravaDrawSearchGeometryPlugin] HaravaDrawSearchGeometry NOT SENT (time difference < 500ms)");
        	return; 
        } 
        
        me._cancelAjaxRequest();
        
        var layerIds = me._buildLayerIdList();
        
        /* let's not start anything we cant' resolve */
        if( !layerIds  ) {
        	me._sandbox.printDebug("[GetInfoPlugin] NO layers with featureInfoEnabled, in scale and visible");
        	return;
        }
        
        me._startAjaxRequest(dteMs);
		
        var ajaxUrl = this._sandbox.getAjaxUrl(); 
       
        var mapVO = me._sandbox.getMap();
        var centerLonLat = me._map.getCenter();
        var centerPx = me._map.getViewPortPxFromLonLat(centerLonLat);
        var bufferPx = 8; // used from line at it buffer is 8px from any direction
        centerPx.x = centerPx.x + bufferPx;
        var centerLonLat2 = me._map.getLonLatFromViewPortPx(centerPx);
        var buffer = centerLonLat2.lon - centerLonLat.lon;
        jQuery.ajax({
            beforeSend : function(x) {
            	me._pendingAjaxQuery.jqhr = x;
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success : function(resp) {
            	var mapWidth = mapVO.getWidth();
            	var showAll = false;
            	if(mapWidth>500)
            	{
            		showAll = true;
            	}
            	
            	var data1 = resp.data1;
            	var data2 = resp.data2;
            	var data3 = resp.data3;
            	var funcs = resp.funcs;
            	
            	var html = '';
            	
            	var data1Name = null;
            	var data1Id = null;
            	var data1Html = "";
            	
            	if(data1.length>0){
            		if(showAll){
            			data1Html += '<table class="harava-gfi-table gfi-full"><tr><td colspan="8" class="harava-gfi-header">'+resp.data1Lang+'</td></tr>';
            			data1Html += resp.data1Header;
            		}
            		else{
            			data1Html += '<table class="harava-gfi-table"><tr><td colspan="4" class="harava-gfi-header">'+resp.data1Lang+'</td></tr>';
            		}
            	}
            	jQuery.each(data1, function(k, data){
            		if(!showAll){           			
            			data1Html += data.html2;
            			data1Name = data.layerName;
            			data1Id = data.layerId;
					} else {
						data1Html += data.html;
						data1Name = data.layerName;
						data1Id = data.layerId;
					}
            	});
            	if(data1.length>0){
            		data1Html += '</table>';
            	}
            	
            	var data2Name = null;
            	var data2Id = null;
            	var data2Html = "";
            	if(data2.length>0){
            		if(showAll){
            			data2Html += '<table class="harava-gfi-table gfi-full"><tr><td colspan="7" class="harava-gfi-header">'+resp.data2Lang+'</td></tr>';
            			data2Html += resp.data2Header;
            		}
            		else{
            			data2Html += '<table class="harava-gfi-table"><tr><td colspan="4" class="harava-gfi-header">'+resp.data2Lang+'</td></tr>';
            		}
            	}
            	jQuery.each(data2, function(k, data){            		
					if(!showAll){
						data2Html += data.html2;
						data2Name = data.layerName;
						data2Id = data.layerId;
					} else {
						data2Html += data.html;
						data2Name = data.layerName;
						data2Id = data.layerId;
					}
				});
            	if(data2.length>0){
            		data2Html += '</table>';
            	}
            	
            	var data3Name = null;
            	var data3Id = null;
            	var data3Html = "";
            	if(data3.length>0){
            		if(showAll){
            			data3Html += '<table class="harava-gfi-table gfi-full"><tr><td colspan="7" class="harava-gfi-header">'+resp.data3Lang+'</td></tr>';
            			data3Html += resp.data3Header;
            		}
            		else{
            			data3Html += '<table class="harava-gfi-table"><tr><td colspan="4" class="harava-gfi-header">'+resp.data3Lang+'</td></tr>';
            		}
            	}
            	jQuery.each(data3, function(k, data){
            		if(data3Id==null){
            			data3Id = data.layerId;
        			}
					if(!showAll){
						data3Html += data.html2;
						data3Name = data.layerName;
						data3Id = data.layerId;
					} else {
						data3Html += data.html;
						data3Name = data.layerName;
						data3Id = data.layerId;
					}
				});            	
            	if(data3.length>0){
            		data3Html += '</table>';
            	}
            	
            	jQuery.each(funcs, function(k, func){
            		eval(func);
            	});
            	
            	
            	/* Resolve showing order */
            	if(resp.first == 'data3'){
            		if(data3Name!=null && data3Id!=null){
                		html += data3Html;
                	}
            		
            		if(data1Name!=null && data1Id!=null){
            			html += data1Html;
                	}
                	
                	if(data2Name!=null && data2Id!=null){
                		html += data2Html;
                	}
            	}
            	else if(resp.first == 'data2'){
            		if(data2Name!=null && data2Id!=null){
            			html += data2Html;
                	}
            		
            		if(data1Name!=null && data1Id!=null){
            			html += data1Html;
                	}               	
                	
                	if(data3Name!=null && data3Id!=null){
                		html += data3Html;
                	}
            	}
            	else if(resp.first == 'data1'){
            		if(data1Name!=null && data1Id!=null){
            			html += data1Html;
                	}
                	
                	if(data2Name!=null && data2Id!=null){
                		html += data2Html;
                	}
                	
                	if(data3Name!=null && data3Id!=null){
                		html += data3Html;
                	}
            	} else {
            		if(data1Name!=null && data1Id!=null){
            			html += data1Html;
                	}
                	
                	if(data2Name!=null && data2Id!=null){
                		html += data2Html;
                	}
                	
                	if(data3Name!=null && data3Id!=null){
                		html += data3Html;
                	}
            	}
            	
				if(html!=''){
					var lonlat = new OpenLayers.LonLat(resp.center.lon, resp.center.lat);
					var parsed = {html: html, title: "Tiedot"};
					parsed.lonlat = lonlat;
					parsed.popupid = me.infoboxId; 
					me._showFeatures(parsed);
				} else {
			    	me._closeGfiInfo();
			    	me.removeAllDrawings();
			    	
			    	if(Message!=null && typeof Message.createMessage === "function" 
			    		&& typeof Message.showMessage === "function" 
			    			&& typeof Message.closeMessage === "function"){
			    		Message.createMessage(me._locale.tooltips.searchNotFound,me._locale.tooltips.searchNotFoundOkButton);
			    		Message.showMessage();
			    		$("#aMessage").click(function(){
			    			Message.closeMessage();
			    			return false;
			    		});
			    	} else {
			    		alert(me._locale.tooltips.searchNotFound);
			    	}
				}
            	me._finishAjaxRequest();
            },
            error : function() {
            	me._finishAjaxRequest();
                me._notifyAjaxFailure();
            },
            always: function() {
            	me._finishAjaxRequest();
            },
            complete: function() {
            	me._finishAjaxRequest();
            },
            data : {
                layerIds : layerIds,
                projection : me.mapModule.getProjection(),
                geom : geom,
                lang: Oskari.getLang(),
                type: type,
                zoom : mapVO.getZoom(),
                buffer: buffer
            },
            type : 'POST',
            dataType : 'json',
            url : ajaxUrl + 'action_route=GetFeatureInfoBySelectedGeometry'
        });
        
    },
    /**
     * @method _cancelAjaxRequest
     * @private
     * Cancel ajax request 
     */
    _cancelAjaxRequest: function() {
    	var me = this;
    	if( !me._pendingAjaxQuery.busy ) {
    		return;
    	}
    	var jqhr = me._pendingAjaxQuery.jqhr;
    	me._pendingAjaxQuery.jqhr = null;
    	if( !jqhr) {
    		return;
    	}    	
    	this._sandbox.printDebug("[HaravaDrawSearchGeometryPlugin] Abort jqhr ajax request");
    	jqhr.abort();
    	jqhr = null;
    	me._pendingAjaxQuery.busy = false;
    },
    /**
     * @method _starAjaxRequest
     * @private
     * Start ajax request 
     */
    _startAjaxRequest: function(dteMs) {
    	var me = this;
		me._pendingAjaxQuery.busy = true;
		me._pendingAjaxQuery.timestamp = dteMs;

    },
    /**
     * @method _finishAjaxRequest
     * @private
     * Finish ajax request 
     */
    _finishAjaxRequest: function() {
    	var me = this;
    	me._pendingAjaxQuery.busy = false;
        me._pendingAjaxQuery.jqhr = null;
        this._sandbox.printDebug("[HaravaDrawSearchGeometryPlugin] finished jqhr ajax request");
    },
    /**
     * @method _buildLayerList
     * @private
     * Build visible layer id list 
     * @return {Array} layer ids
     */
    _buildLayerIdList: function()  {
        var me = this;
    	var selected = me._sandbox.findAllSelectedMapLayers();
        var layerIds = null;
        
 		var mapScale = me._sandbox.getMap().getScale();
        
        for (var i = 0; i < selected.length; i++) {
        	var layer = selected[i]

        	if( !layer.isInScale(mapScale) ) {
				continue;
			}
			if( !layer.isFeatureInfoEnabled() ) {
				continue;
			}        	
			if( !layer.isVisible() ) {
				continue;
			}
			
			if( !layerIds ) {
				layerIds = "";
			}
			        	
            if (layerIds !== "") {
                layerIds += ",";
            }

            layerIds += layer.getId();
        }
        
        return layerIds;
    },
    /**
     * @method _notifyAjaxFailure
     * @private
     * Notify ajax failure 
     */
    _notifyAjaxFailure: function() {
    	 var me = this;
    	 me._sandbox.printDebug("[HaravaDrawSearchGeometryPlugin] GetFeatureInfo AJAX failed");
    },
    /**
     * @method _isAjaxRequestBusy
     * @private
     * Check at if ajax request is busy
     * @return {Boolean} true if ajax request is busy, else false
     */
    _isAjaxRequestBusy: function() {
    	var me = this;
    	return me._pendingAjaxQuery.busy;
    },
    /**
     * @method removeAllDrawings
     * Remove drawed area selection on openlayer map
     */
    removeAllDrawings: function(){
    	var me = this;
    	if(me._searchLayer!=null){
    		me._searchLayer.removeAllFeatures();
    	}
    	if(me._oldSearchLayer!=null){
    		me._oldSearchLayer.removeAllFeatures();
    	}
    },
    /**
     * @method finishedDrawing
     * Finish drawing
     */
    finishedDrawing : function(){
    	var me = this;
    	var feat = me._searchLayer.features[0];
    	
    	me._closeGfiInfo();
    	if(feat!=null){
    		me._handleSearchByGeom(feat.geometry.toString());	    	
    	}
    	me._searchLayer.removeAllFeatures();
    	me._oldSearchLayer.removeAllFeatures();
    	me._oldSearchLayer.addFeatures([feat]);
    	
    },
    /**
     * Shows multiple features in an infobox
     *
     * @param {Array} data
     */
    _showFeatures : function(data) {
    	var me = this;
        var contentHtml = [];
        var content = {};
        content.html = data.html;
        var rn = "HaravaInfoBox.ShowInfoBoxRequest";
        var rb = me._sandbox.getRequestBuilder(rn);
        var r = rb(data.popupid, "Info", [content], data.lonlat, true);
        me._sandbox.request(me, r);
    },
    /**
     * @method startSearch
     * Start searching by geometry
     * @param {String} searchMode search mode of plugin
     */
    startSearch : function(searchMode){
    	var me = this;
    	me._closeGfiInfo();
    	me.removeAllDrawings();
    	me.toggleControl(searchMode);    	
    },
    /**
     * Enables the given search control
     * Disables all the other search controls
     * @param searchMode search control to activate (if undefined, disables all
     * controls)
     * @method
     */
    toggleControl : function(searchMode) {
    	this.currentSearchMode = searchMode;
    	var me = this;
        for(var key in this.searchControls) {
            var control = this.searchControls[key];
            if(searchMode == key) {
                control.activate();
            } else {
                control.deactivate();
            }
        }
    },
    /**
     * @method register
     * Interface method for the plugin protocol
     */
    register : function() {

    },
    /**
     * @method unregister
     * Interface method for the plugin protocol
     */
    unregister : function() {

    },
    /**
     * @method startPlugin
     *
     * Interface method for the plugin protocol
     *
     * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
     *          reference to application sandbox
     */
    startPlugin : function(sandbox) {
        var me = this;
        if (sandbox && sandbox.register) {
            this._sandbox = sandbox;
        }
        this._map = this.getMapModule().getMap();

        this._sandbox.register(this);
        for (p in this.eventHandlers ) {
            this._sandbox.registerForEventByName(this, p);
        }
    },
    /**
     * @method stopPlugin
     *
     * Interface method for the plugin protocol
     *
     * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
     *          reference to application sandbox
     */
    stopPlugin : function(sandbox) {
        var me = this;
        // hide infobox if open
        me._closeGfiInfo();
        
        if (sandbox && sandbox.register) {
            this._sandbox = sandbox;
        }
        
        var openlayersMap = this.mapModule.getMap();
        
        if(me._searchLayer!=null){
        	openlayersMap.removeLayer(me._searchLayer);
    	}
    	if(me._oldSearchLayer!=null){
    		openlayersMap.removeLayer(me._oldSearchLayer);
    	}
        
        
        this._sandbox.unregister(this);
        this._map = null;
        this._sandbox = null;
    },
    /**
     * @method _closeGfiInfo
     * @private
     * Closes the infobox with GFI data
     */
    _closeGfiInfo : function() {
        var rn = "HaravaInfoBox.HideInfoBoxRequest";
        var rb = this._sandbox.getRequestBuilder(rn);
        var r = rb(this.infoboxId);
        this._sandbox.request(this, r);
    },
    /**
     * @method start
     *
     * Interface method for the module protocol
     *
     * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
     *          reference to application sandbox
     */
    start : function(sandbox) {
    },
    /**
     * @method stop
     *
     * Interface method for the module protocol
     *
     * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
     *          reference to application sandbox
     */
    stop : function(sandbox) {
    },
    /**
     * @method setEnabled
     * Enables or disables gfi functionality
     * @param {Boolean} blnEnabled
     *          true to enable, false to disable
     */
    setEnabled : function(blnEnabled) {
        this.enabled = (blnEnabled === true);
        // close existing if disabled
        if(!this.enabled) {
            this._closeGfiInfo();
        }
    },
    /**
     * @property {Object} eventHandlers
     * @static
     */
    eventHandlers : {
    	
    },
    /**
     * @method onEvent
     * @param {Oskari.mapframework.event.Event} event a Oskari event object
     * Event is handled forwarded to correct #eventHandlers if found or discarded
     * if not.
     */
    onEvent : function(event) {
        /*var me = this;
        return this.eventHandlers[event.getName()].apply(this, [event]);
        */
    }
}, {
    /**
     * @property {Object} protocol
     * @static
     */
    'protocol' : ["Oskari.mapframework.module.Module", "Oskari.mapframework.ui.module.common.mapmodule.Plugin"]
});
