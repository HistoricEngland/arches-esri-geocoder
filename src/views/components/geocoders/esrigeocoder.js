define(['knockout', 'mapbox-gl', 'arches','views/components/geocoders/base-geocoder','geocoder-templates'],
function (ko, mapboxgl, arches, BaseGeocoderViewModel) {
    return ko.components.register('views/components/geocoders/esrigeocoder', {
        viewModel: function(params) {
            BaseGeocoderViewModel.apply(this, [params]);
            var self = this;
            this.placeholder = params.placeholder || ko.observable('Locate a Place or Address');
            this.anchorLayerId = params.anchorLayerId;
            this.apiKey = params.api_key() || arches.mapboxApiKey
            this.map = params.map;

            this.options.subscribe(function () {
                self.selection(null);
            });



            function returnESRISearchOptions(text,magickey,count){
                return new Promise((resolve) => {
                    httpLine = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine="' + text + '"&magicKey="' + magickey + '"&f=json'
                    $.ajax({
                        type: 'GET',
                        url: httpLine,
                        data: {
                            //access_token: ko.unwrap(self.apiKey)
                        },
                        success: function(res){

                            var resultLocations = res["candidates"]
                            var returnObjects = []

                            for(r in resultLocations){
                                rL = resultLocations[r]
                                rObject = {"geometry":{}}
                                rObject['id'] = count
                                rObject['text'] = (rL)['address']
                                rObject['geometry']["type"] = "Point"
                                rObject['geometry']['coordinates'] = [rL['location']['x'],rL['location']['y']]
                                returnObjects.push(rObject)
                            
                            if(returnObjects.length == resultLocations.length){
                                resolve(returnObjects);
                            }
                            
                            }
                        }
                    })
                })
            }


            this.updateResults = function(data) {
                    self.options([]);
                    self.firstResults = []
                    if (data.length > 3) {
                        self.loading(true);
                        $.ajax({
                            type: 'GET',
                            url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text='+ data + '&f=pjson',
                            data: {
                                //access_token: ko.unwrap(self.apiKey)
                            },
                            success: function(res){
                                var resultsParse = JSON.parse(res);
                                var resultsSuggest = resultsParse["suggestions"];
                                var resultsOut = _.map(resultsSuggest, function(feature){
                                    return {
                                        'text':feature['text'],
                                        'magicKey': feature['magicKey'],
                                        'isCollection': feature['isCollection']
                                    }})
                                    
                                    self.firstResults = resultsOut
                                },
                                complete: function () {
                                    self.loading(false);
                                }
                            }).then(function(){
                                //console.log("results",self.firstResults);
                                self.outputResults = []
                                var resultCount = 0;
                                this.promises = []
                                

                                for(fR in self.firstResults){
                                    textValue = (self.firstResults[fR])["text"]
                                    keyValue = (self.firstResults[fR])["magicKey"]
                                    this.promises.push(returnESRISearchOptions(textValue,keyValue,resultCount))
                                    resultCount++;
                                }


                                Promise.all(this.promises).then((results) => {
                                    //console.log("All done", results);
                                    var outputOptions = []
                                    for(r in results){
                                        var singlePromiseReturn = results[r];
                                        for(rr in singlePromiseReturn){
                                            var singleValueReturn = singlePromiseReturn[rr]
                                            outputOptions.push(singleValueReturn);
                                        }
                                    }

                                    self.options(outputOptions);
                                  })

                            })
                    }
                   
            };
            

            this.query.subscribe(this.updateResults);

            this.isFocused.subscribe(function () {
                self.focusItem(null);
            });
        },
        template: {
            require: 'text!templates/views/components/geocoders/esrigeocoder.htm'
        }
    });
})
