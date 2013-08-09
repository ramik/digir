Oskari.registerLocalization({
	"lang" : "sv",
	"key" : "LayerSelector",
	"value" : {
		"title" : "Kartlager",
		"desc" : "",
		"flyout" : {
			"title" : "admin: Kartlager"
		},
		"tile" : {
			"title" : "A: karttatasot",
			"tooltip" : "."
		},
		"view" : {
			"title" : "",
			"prompt" : "",
			"templates" : {
			}
		},
		"errors" : {
            "title": "Fel!",
            "generic": "Systemfel. Försök på nytt senare.",
			"loadFailed" : "Fel i laddningen av kartlager. Ladda ned sidan på nytt i din läsare och välj kartlagren.",
            "noResults": "ökningen gav inga resultat."
		},
        "loading" : "Laddar...",
		"filter" : {
			"text" : "Sök kartlager",
			"inspire" : "Enligt tema",
			"organization" : "Enligt dataproducent",
			"published" : "Användare"
		},
        "published" : {
            "organization" : "Publicerad kartlager",
            "inspire" : "Publicerad kartlager"
        },
		"tooltip" : {
			"type-base" : "Bakgrundskarta",
			"type-wms" : "kartlager",
			"type-wfs" : "Dataprodukt"
		},
		"backendStatus" : {
			"OK" : {
				"tooltip" : "Kartlagret är tillgängligt just nu.",
				"iconClass" : "backendstatus-ok"
			},
			"DOWN" : {
				"tooltip" : "Kartlagret är inte tillgängligt just nu.",
				"iconClass" : "backendstatus-down"
			},
			"MAINTENANCE" : {
				"tooltip" : "Avbrott i kartlagrets tillgänglighet är att vänta inom de närmaste dagarna.",
				"iconClass" : "backendstatus-maintenance"
			},
			"UNKNOWN" : {
				"tooltip" : "",
				"iconClass" : "backendstatus-ok"
			}
		},
		"admin" : {
			"addOrganization" 		: "Tillägg dataproducent",
			"addOrganizationDesc"	: "Tillägg dataproducent dvs en ny organisation",
			"addInspire" 			: "Tillägg ämne",
			"addInspireDesc" 		: "Tillägg ämne dvs nytt Inspire&shy;-teema",
			"addLayer" 				: "Tillägg lager",
			"addLayerDesc"			: "Tillägg lager till detta Inspire&shy;-teema",
			"edit" 					: "Editera", 
			"editDesc" 				: "Editera namn",
			"layerType"				: "Lagertyp",
			"layerTypeDesc" 		: "Lagrets typ: WMS, WFS, WMTS",
			"interfaceVersion"		: "Gränss&shy;nittets version",
			"interfaceVersionDesc" 	: "Gränss&shy;nittets version",
			"wmslayer"				: "WMS Lager",
			"wms1_1_1"				: "WMS 1.1.1",
			"wms1_3_0"				: "WMS 1.3.0",
			"wfslayer"				: "WFS Lager",
			"wmtslayer"				: "WMTS Lager",
			"getInfo" 				: "Sök data",
			"selectClass" 			: "Valitse aihe",
			"selectClassDesc" 		: "Valitse aihe",

			"wmsInterfaceAddress" 	: "WMS&shy;-gränssnittets address",
			"wmsInterfaceAddressDesc": "WMS&shy;-gränssnittets URL-address separerat med komma",
			"wmsServiceMetaId" 		: "WMS metadata tagg",
			"wmsServiceMetaIdDesc" 	: "WMS&shy;-tjänstens metadata filtagg",
			"layerNameAndDesc" 		: "Lagrets namn och kort beskrivning",

			"metaInfoIdDesc" 		: "Geodata&shy;registrets metadata filtagg, som unikt identifierar metadatans XML beskrivning",
			"metaInfoId" 			: "Metadatans filtagg",
			"wmsName" 				: "WMS namn",
			"wmsNameDesc" 			: "WMS lager dvs unikt namn",

			"addInspireName" 		: "Ämnets namn",
			"addInspireNameTitle" 	: "Ämnets namn",
			"addOrganizationName" 	: "Data&shy;producentens namn",
			"addOrganizationNameTitle" : "Data&shy;producentens namn",
			"addNewClass" 			: "Tillägg nytt teema",
			"addNewLayer" 			: "Tillägg nytt kartlager",
			"addNewOrganization" 	: "Tillägg ny dataproducent",
			"addInspireThemes" 		: "Tillägg ämne",
			"addInspireThemesDesc" 	: "Tillägg ämnen enligt InspireTheme",
			"opacity" 				: "Transparens",
			"opacityDesc" 			: "Lagrets transparens",
			"style" 				: "Stil",
			"styleDesc" 			: "Stil",

			"minScale" 				: "Minimi&shy;skala",
			"minScaleDesc" 			: "Lagrets minimiskala (1:5669294)",
			"minScalePlaceholder" 	: "5669294 (1:5669294)Lagrets minimiskala",
			"maxScale" 				: "Maximi&shy;skala",
			"maxScaleDesc" 			: "Lagrets maximiskala (1:1)",
			"maxScalePlaceholder" 	: "1 (1:1) Lagrets maximiskala",
			"legendaImage" 			: "Förklarings&shy;bildens address",
			"legendaImageDesc" 		: "Förklarings&shy;bildens address",
			"legendaImagePlaceholder" : "Förklarings&shy;bildens address",
			"gfiResponseType" 		: "GFI svartyp",
			"gfiResponseTypeDesc" 	: "Svarets typ dvs Get Feature Info (GFI)",
			"gfiStyle" 				: "GFI stil",
			"gfiStyleDesc" 			: "GFI stil (XSLT)",

			"finnish" 				: "Suomeksi:",
			"finnishTitle" 			: "Fi",
			"finnishPlaceholder" 	: "Nimi suomeksi",
			"finnishDescPlaceholder" : "Kuvaus suomeksi",
			"swedish" 				: "På svenska:",
			"swedishTitle" 			: "Sv",
			"swedishPlaceholder" 	: "Namn på svenska",
			"swedishDescPlaceholder" : "Beskrivning på svenska",
			"english" 				: "In English:",
			"englishTitle" 			: "En",
			"englishPlaceholder" 	: "Name in English",
			"englishDescPlaceholder" : "Description in English",

			"interfaceAddress" 		: "Gränssnitten address",
			"interfaceAddressDesc" 	: "WMS address för lager definitionen"

		},
		"cancel" 	: "Tillbaka",
		"add" 		: "Tillägg",
		"delete" 	: "Ta bort"
	}
});
