Oskari.registerLocalization({
    "lang" : "sv",
    "key" : "StatsGrid",
    "value" : {
        "title" : "patiopoc",
        "desc" : "",
        "tile" : {
            "title" : "patiopoc"
        },
        "view" : {
            "title" : "patiopoc",
            "message" : "patiopoc"
        },
        "gender": "Kön",
        "genders" : {
            "male" : "män",
            "female": "kvinnor",
            "total": "totalt"
        },
        "addColumn": "Hämta data",
        "removeColumn" : "Radera",
        "indicators" : "Indikator",
        "year": "År",
        "buttons" : {
            "ok"    : "OK",
            "cancel": "Avbryta"
        },
        "sotka": {
            "municipality" :            "Kommun",
            "code" :                    "Kod",
            "errorTitle" :              "Fel",
            "regionDataError":          "Fel att få Sotka regionen data.",
            "regionDataXHRError":       "Fel vid laddning av Sotka regionen data",
            "indicatorsDataError":      "Fel att få Sotka indikatorer.",
            "indicatorsDataXHRError":   "Fel vid laddning av Sotka indikatorer.",
            "indicatorMetaError" :      "Fel att få Sotka indikator metadata",
            "indicatorMetaXHRError" :   "Fel vid laddning av Sotka indikator metadata",
            "indicatorDataError" :      "Fel att få Sotka indikator data",
            "indicatorDataXHRError" :   "Fel vid laddning av Sotka indikator data",
            "descriptionTitle" :        "Beskrivning",
            "sourceTitle" :             "Upphov"

        },
          "classify": {
            "classify":                 "Klassificera",
            "classifymethod":           "Metod",
            "classes":                  "Klasser",
            "jenks":                    "Jenks intervall",
            "quantile" :                "Quantile intervall",
            "eqinterval" :              "Eqintervall",
            "manual":                   "Manuell klassificering",
            "manualPlaceholder":        "Ange siffrorna, separerade med kommatecken.",
            "manualRangeError":         "Det bör vara minst {min} och högst {max} siffror!",
            "nanError":                 "Ett värde var inte ett nummer!",
			"infoTitle":                "Manuell klassificering",
			"info":                     "Ange siffrorna separerade med kommatecken. Punkt fungerar som ett decimaltecken. Först in den nedre gränsen, då gränserna klass och slutligen den övre gränsen. T.ex. genom att skriva \"0, 10,5, 24, 30,2, 57, 73,1\" du får fem klasser med nedre och övre gränsen satt till 0 och 73,1 och klass gränser mellan dem. Värden kvar utanför gränserna kommer att uteslutas."
        },
        "colorset" : {
            "button": "Färger",
            "flipButton": "Vända färger",
			"themeselection" : "Välj färgtema",
			"setselection" : "Välj färgset",
			"sequential" : "Kvantitiv",
			"qualitative" : "Kvalitativ",
			"divergent" : "Divergent",
			"info2" : "Vända färger - använd muspekaren för att välja en färg från sekvensen färgskalan",
			"cancel" : "Avsluta"
			
		},
        "statistic" : {
            "avg" : "genomsnitt",
            "max" : "Maximivärde",
            "mde" : "Modus",
            "mdn" : "Median",
            "min" : "Minimivärde",
            "std" : "Standardavvikelse",
            "sum" : "Summa"
        },
        "values"        : "värden",
        "municipality"  : "Kommuner",
        "selectRows"    : "Markera rader",
        "not_included"  : "Inte inlcuded kommuner",
        "noMatch"       : "Inga matchade indikatorer",
        "selectIndicator": "Välja en indikator"

    }
});
