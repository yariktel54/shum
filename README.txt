SHUM site package

Files:
- index.html
- styles.css
- texts.json

How it works:
- Open index.html on a web server
- Language switch uses URL params:
  ?lang=ua
  ?lang=en
- Texts are loaded from texts.json

Important:
If you open the file directly from disk (file://), some browsers may block fetch('texts.json').
For normal work, place the files on a server/hosting or run a local static server.
