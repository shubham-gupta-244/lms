one more thing to do when you call the api from backend to fetch the course data you should store it in a local variable .
if the fetch retry and when you get the data store it and send to frotend , the next reqtuest front end make check the data present locally if yes send back the data to frontend and do not make an api call .
if the data is lost then only makes a api call to fetch data .
