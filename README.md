# arches-esri-geocoder
A custom Arches geocoder that uses the ESRI World Geocoding services as an alternative to the standard Mapbox geocoder.
# Files
The Arches ESRI Geocoder is comprised of two files:
```
<drive>:\warden
|               
|    
+---media
|   |           
|   +--js
|      |       
|      \---views
|          \---components
|              \---geocoders
|              |        esrigeocoder.js    
|           
+---templates
|   |       
|   \---views
|       \---components     
|           \---geocoders
|           |       esrigeocoder.htm


```
##ESRI Geocoder APIs
The Arches ESRI Geocoder uses the following ESRI APIs to return geographic search results:
[https://developers.arcgis.com/rest/geocode/api-reference/geocoding-suggest.htm](https://developers.arcgis.com/rest/geocode/api-reference/geocoding-suggest.htm ) 
[https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm](https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm ) 

##How the Geocoder uses the ESRI APIs

The first part of the geocoder creates an array from the results returned by the SUGGEST geocoding API.  This array is then used to create promises that query the FINDADDRESSCANDIDTATES geocoding API, returning the name of the suggested location, the type of geometry (point) and an x and y coordinate for the result in WGS 1984 coordinate format.  Once all the promises have been resolved, the results are added to an array which populates the options observable from the esrigeocoder.htm template

##Adding Arches ESRI Geocoder to Database

The Arches ESRI Geocoder references need to be added directly into the database as there's no command line method of doing so at present.  Use the following SQL statement to add the row to the public.geocoders table and then commit it.

``INSERT INTO public.geocoders(
	geocoderid, name, component, api_key)
	VALUES ('10000000-0000-0000-0000-010000000001', 'Esri', 'views/components/geocoders/esrigeocoder', '');``