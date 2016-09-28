console.error('Starting');
var spawn   = require('child_process').spawn;
var fs      = require('fs');
var path    = require ('path');
var formidable = require('formidable');
var pg      = require('pg');
var Client  = require('pg').Client;
var schema  = 'urbanfarming';
var table   = 'livedateyo';
var liveData = schema + "." + table;
var cors    = require('express-cors');
var vcapServices = require('./vcapServices');
var conStr  = vcapServices.elephantsql[0].credentials.uri; 
var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var passport  = require('passport');




var app     = express();
var port    = (process.env.VCAP_APP_PORT || 4000);
var util = require('util');


app.use(cors({
    allowedOrigins: [
        'mybluemix.net', 'localhost:4000', 'tablefarm.co.uk'  
    ]
}))

app.listen(port, (err) => { 
    if (err) {
        return console.log('something bad happened.', err)
    }
    console.log(`server is listening on ${port}`)
});

app.use((request, response, next) => {
    console.log(request.headers)
        next()
})

app.use(function(req, res, next) {
    if(req.url.substr(-1) !== '/')
        res.redirect(301, req.url + "/");
    else
        next();
});

app.set('views',__dirname);
app.engine('handlebars', exphbs);
app.set('view engine', '');

// app.use(express.static(path.join(__dirname, 'views')));
app.use("/urbanfarming/public", express.static(path.join(__dirname, 'public')));
// app.use("/urbanfarming/public/images", express.static(path.join(__dirname, 'public/images')));
app.use("/urbanfarming/public/", express.static('public'));
//app.use("/urbanfarming/public/images", express.static('public/images'));

app.get('/urbanfarming/public/files/flower.gif/', function(req, res) {
    res.sendFile(__dirname + "/public/files/flower.gif")
})

app.get('/urbanfarming/public/foo.jpg/', function(req, res) {
    res.sendFile(__dirname + "/public/foo.jpg")
})
app.get('/urbanfarming/public/foo1.JPEG/', function(req, res) {
    res.sendFile(__dirname + "/public/foo1.JPEG")
})
app.get('/urbanfarming/public/files/growRig1.jpg/', function(req, res) {
    res.sendFile(__dirname + "/public/files/growRig1.jpg")
})
app.get('/urbanfarming/public/files/growRig2.jpg/', function(req, res) {
    res.sendFile(__dirname + "/public/files/growRig2.jpg")
})
app.get('/urbanfarming/public/index.css/', function(req, res) {
    res.sendFile(__dirname + "/public/index.css")
})

app.get('/urbanfarming/public/files/scotsman_article.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/scotsman_article.jpg");
})

app.get('/urbanfarming/public/files/uoe-logo.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/uoe-logo.jpg");
})

app.get('/urbanfarming/public/files/ecci-logo.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/ecci-logo.jpg");
})

app.get('/urbanfarming/public/files/censis-logo.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/censis-logo.jpg");
})

app.get('/urbanfarming/public/files/uos-logo.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/uos-logo.jpg");
})

app.get('/urbanfarming/public/files/child.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/child.jpg");
})

app.get('/urbanfarming/public/files/strawberry.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/strawberry.jpg");
})

app.get('/urbanfarming/public/files/website.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/website.jpg");
})
app.get('/urbanfarming/public/files/lightArray.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/lightArray.jpg");
})
app.get('/urbanfarming/public/files/makingLightingRigP.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/makingLightingRigP.jpg");
})
app.get('/urbanfarming/public/files/getMotivated.jpg/', function (req, res) {
    res.sendFile(__dirname + "/public/files/getMotivated.jpg");
})

checkTablesExist();

var clientPromise;
function askDatabase( sql, callback ) {
    console.log(sql)
        if (clientPromise == null) {
            clientPromise = pg.connect(conStr);
        } 
    clientPromise.then(function (client) {
        client.query(sql, callback);
    })
}



function createTables(sql, sql1){
    askDatabase(sql , function(err){
        if (err) {
            console.error(err)
        }
        askDatabase(sql1, function(err){
            if (err) {
                console.error(err)
            }
        })
    });
}
function createSchemaAndTables(){
    var checkSchema = "SELECT 1 FROM information_schema.tables WHERE table_schema='"+schema+"'";
    var createLiveData = `CREATE TABLE ${liveData} (id SERIAL  PRIMARY KEY, image BYTEA , soilMoisture INTEGER, relHumidity INTEGER, temperature INTEGER, time TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL, plantName VARCHAR(50), lightLuxLevel INTEGER)`;
    var AddARowToLiveData = `INSERT INTO ${liveData} (soilMoisture, relHumidity, temperature) VALUES (100 ,100 ,100)`;

    askDatabase(checkSchema, function(err, result){
        if (err) {
            console.error(err)
        }

        if (result.rowCount === 0) {
            askDatabase("CREATE SCHEMA " + schema, function(err){
                if (err) {
                    console.error(err)
                }  
                createTables(createLiveData, AddARowToLiveData);
            })
        }
        else {
            createTables(createLiveData, AddARowToLiveData);
        }
    })
}

function checkTablesExist(){    
    var tableCheck = "SELECT 1 FROM information_schema.tables WHERE table_name='"+table+"' and table_schema='"+schema+"'";
    console.log("checking tables");
    askDatabase(tableCheck, function(err, row) {
        if (err) {console.error(err)}
        console.log(row);
        if (row.rowCount === 0 ) {
            console.log("livedata doesn't exist, creating");
            createSchemaAndTables()
        }
        else {
            console.log("livedata does exist");
        }
    });
}


function formatDate(d){
    dd   =   ('0' + d.getDate()).slice(-2);
    mm   =   ('0' + d.getMonth()).slice(-2);
    yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function formatTime(t, o ){
    o = typeof o !== 'undefined' ? o: 0
        hh = parseInt(t.getHours())
        hh = hh - parseInt(o);  
    console.log(hh)
        hh = ('0' + hh.toString()).slice(-2); 
    mm = ('0' + t.getMinutes()).slice(-2) ;
    ss = t.getSeconds();
    time = `${hh}:${mm}`;
    return time;
}
function addRow(content, row) {
    content +="<tr> "+
        "<td><img src='http://tablefarm.co.uk/urbanfarming/img?x=" + row.id.toString() + "' /></td>"+ 
        "<td id='date' >" +formatDate(row.time)+ "</td>"+
        "<td>" + formatTime(row.time) +"</td>"+
        "<td>" +row.plantname+"</td>"+
        "<td>" +row.lightluxlevel+" lux</td>"+
        "<td>" +row.soilmoisture+"%</td>"+
        "<td>" +row.relhumidity+"%</td>"+
        "<td>" +row.temperature+"C</td>"+
        "<td>" +row.colour+"C</td>"+
        "</tr>";
    return content;
}

function getLastXRows(request, response)  {
    var content = "<table id='view'>" +
        "<tr>" +
        "<th>Image</th>"+  "<th>date</th>"+ "<th>time</th>"+ "<th>PlantName</th>"+ "<th>light lux level</th>"+ "<th>soilMoisture</th>"+ "<th>relative Humidity</th>"+ "<th>temperature</th>"+
        "</tr>";
    var x = request.query.x;
    x = 10;
    var sql="SELECT * FROM "+liveData +" WHERE id >(SELECT MAX(id) - "+ x+ " FROM "+liveData +" )";
    console.log(sql);
    askDatabase(sql, function(err, result) {
        if (err) {
            response.write('Error getting data');
            console.error(err)
        }
        else {
            var N = result.rows.length;
            for (var n =0; n <N; n++){
                content = addRow(content, result.rows[n]) ;
            }
            content += "</table>" ;
            response.writeHead(200, {
                'Content-Type'  : 'text/html', 
                'Content-Length': Buffer.byteLength(content)});
            response.write(content); 
        }
    })
}


function getrgb(hex) {
    var result = hex.match(/^#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/i);
    console.log(result);
    col = result ? { r: parseInt(result[1], 16),  g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : {r:0, g:0, b:0};  
    console.log(col);
    return col ;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getHome(request, response, o)  {
    var content = "<table id='data'><tr>";
    var sql="SELECT * FROM "+liveData+" WHERE id=(SELECT MAX(id) FROM "+liveData+") ";
    askDatabase (sql, function(err, result){
        if (err) { console.error(err); return false }
        var row = result.rows[0];
        date = formatDate(row.time);
        time = formatTime(row.time, o);
        var rgb = getrgb(row.colour); 
        var rgbf = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
        content +="<th>                   </th><td><img src='http://tablefarm.co.uk/urbanfarming/img?f=1/' /></td>        </tr>"+
            "<tr><th>Date:                </th><td id='date' >" +date+ "</td></tr>"+
            "<tr><th>Time:                </th><td id='time'>" +time+"</td>                          </tr>"+
            "<tr><th>Plant name:          </th><td>" +row.plantname+"</td>                 </tr>"+
            "<tr><th>Lighting lux level:  </th><td>" +row.lightluxlevel+" lux</td>         </tr>"+
            "<tr><th>Soil Moisture:       </th><td>" +row.soilmoisture+"%</td>             </tr>"+
            "<tr><th>Relative Humidity:   </th><td>" +row.relhumidity+"%</td>              </tr>"+
            "<tr><th>Colour:              </th><td  bgcolor='"+row.colour+"'><font color="+rgbf+ "> red="+rgb.r+" green = "+rgb.g+", blue="+rgb.b+"</font></td>               </tr>"+    
            "<tr><th>Ambient temperature: </th><td>" +row.temperature+"C</td>";
        content+= "</tr></table>";
        response.write(content);
        response.end();
    })
}

function formatImageForDB(path, response, callback){
    fs.readFile(path,'hex', function(err, data) {
        if (!err) {
            data = '\\x'+data;

            callback(null, data);
        }else{
            console.error(err);
            callback(err);
        }
    });
}
function processTextFields(fields, response, request, target){
    var moisture =  fields.soilMoisture;
    var colour   = fields.colour;
    var humidity = fields.relHumidity;
    var temp     = fields.temperature;
    var name     = (( fields.plantName== "")?  'a' : fields.plantName);
    var light    = fields.lightLuxLevel;
    if (target){   
        var sql=`INSERT INTO ${liveData} (soilMoisture, relHumidity, temperature, image, plantName, lightLuxLevel, colour) VALUES ( ${moisture}, ${humidity}, ${temp}, '${target}', '${name}', ${light}, '${colour}')`;
    }
    else {
        var sql=`INSERT INTO ${liveData} (soilMoisture, relHumidity, temperature, plantName, lightLuxLevel, colour) VALUES ( ${moisture}, ${humidity}, ${temp},  '${name}', ${light}, '${colour}')`;
    }
    askDatabase(sql, function(err, result){;
        if(err){
            console.error(err);
            response.write('The data upload was unsucessful. Couldn\'t connect to postgres. Please try again later.');
            response.end();
        }
        else {
            response.writeHead(200, {'content-type':'text/plain'});         
            response.write('received upload:\n\n');
            response.end(util.inspect({fields:fields}));
        }
    })
}

function getImageSQL(res,req, x,f){
    var sql = "";
    if (x && f){
        sql = "SELECT image FROM " + liveData + " WHERE id>=" +x +" AND image IS NOT NULL LIMIT 1;";
    }
    else if (x==null && f){
        sql = "SELECT image FROM " + liveData + " WHERE id=(SELECT MAX(id) FROM  "+liveData +" WHERE image IS NOT NULL)";
    }
    else if(x && f==null) {
        sql = "SELECT image FROM " + liveData + " WHERE id=" +x ;
    }

    else {
        sql = "SELECT image FROM " + liveData + " WHERE id=(SELECT MAX(id) FROM  "+liveData+")" ;
    }
    return sql;
}

function formatImageForDisplay(req,res, x, f, callback){
    sql = getImageSQL(res, req, x,f);
    askDatabase(sql , function(err, result){
        if (err) {
            console.error(err)
        }
        console.log(result);
        if (result.rowCount === 0){
            console.log("not sending image")
                callback(__dirname +"/public/test.jpg");
        }
        else if (result.rows[0].image == undefined) {
            console.log("not sending image")
                callback(__dirname +"/public/test.jpg");
        }
        else {
            fs.writeFile('public/foo.jpg', result.rows[0].image, function (errr) {
                callback(__dirname +"/public/foo.jpg");
            })
        }
    })
}

function processForm(req, res, callback){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        console.log(fields);
        callback( fields.after, fields.before);
    })
}


function processDataUpload(request, response){
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
        if (files) {
            console.log(files.image.size);
            if (files.image.size<1) {
                processTextFields(fields, response, request, null);
            }
            else {
                formatImageForDB(files.image.path, response, function (err, target){
                    processTextFields(fields, response, request, target);
                })
            }
        }
        else {

            processTextFields(fields, response, request, null);

        }
    })
}

function processImage(file, callback){

    spawned_process = spawn('python', ["process_images/greenScore.py", file, 3, 1]);

    spawned_process.stdout.on('data', function(data){
        console.log("GOT DATA");
        d = data.toString('utf8');
        console.log(d);
        callback(d);
    })

    spawned_process.on('message', function(message){
        console.log("GOT A MESSAGE");
        console.log(message.toString('utf8'));
    })

    spawned_process.stderr.on('data', function(data) {
        console.log("GOT AN ERROR");
        console.log(data.toString('utf8'));
    })

    spawned_process.on('close', function(code) {
        console.log("child process exited with a code: "+ code);
        callback(null)
    })

}

function generateChart(callback, after, before){
    var sql = "SELECT * FROM "+ liveData;
    var f = true;
    if (!before && !after) {
        var sql = "SELECT * FROM "+ liveData + " WHERE id % 4=0" ;
        f = false;
    }
    if (after){
        var b = sql + " AND time > '" + after + "'";
        if (f){ 
            b = sql + " WHERE time > '" + after + "'";
            f = false;
        }
        sql = b;
    }
    if (before){
        var b = sql + " AND time < '" + before + "'";
        if (f){ 
            b = sql + " WHERE time > '" + after + "'";
        }
        sql = b
    }
    sql = sql +" ORDER BY id DESC LIMIT 255";
    fs.readFile('chart.html', 'utf-8', function( err, data) {
        var temp = [];
        var humi = [];
        var luxl = [];
        var soil = [];
        var labelData = [];
        askDatabase(sql , function(err, result) {
            for (var n =0; n<result.rowCount; n++ ){
                labelData.push(result.rows[n].time);
                temp.push(result.rows[n].temperature);    
                humi.push(result.rows[n].relhumidity);    
                luxl.push(result.rows[n].lightluxlevel);
                soil.push(result.rows[n].soilmoisture);
            };
            var c = data.replace('{{temp}}', JSON.stringify(temp));
            c = c.replace('{{labels}}',JSON.stringify(labelData));
            c = c.replace('{{humi}}', JSON.stringify(humi));
            c = c.replace('{{soil}}', JSON.stringify(soil));
            c = c.replace('{{luxl}}', JSON.stringify(luxl));
            if (after) {
                c = c.replace('{{after}}', JSON.stringify(after))
            } else {
                c = c.replace('{{after}}', JSON.stringify("the dawn of time"))
            }
            if (before) {
                c = c.replace('{{before}}', JSON.stringify(before))
            } else {
                c = c.replace('{{before}}', JSON.stringify("the end of time"))
            }
            callback(c)
        })
    })
}

function displayChart(c, res){
    res.writeHead( 200, {'Content-Type':'text/html'});
    res.write(c);
    res.end();
}

function insertIntoLayout(file, callback){
    fs.readFile(file, 'utf8', function(err, index){
        if (err) {
            console.error(err);
        }
        else {
            index= index.toString();
            fs.readFile('layout.html', 'utf8', function(err, layout) {;
                if (err) {
                    console.error(err);
                }else {
                    layout  = layout.replace('{{content}}',index);
                    callback(layout);
                }

            })
        }
    })
}
app.post('/urbanfarming/data', function(req, res){
    processDataUpload(req, res)  
})

app.post('/urbanfarming/chart', function(req, res) {
    var a;
    var b;
    processForm(req, res, (a, b) =>{
        console.log(a);
        console.log(b);
        generateChart((c) => {displayChart(c, res)},a,b);      
    })
})

app.get('/', function (req, res) {
    res.redirect(301,  "/urbanfarming/");
})

app.get('/urbanfarming/data', (req, res) => {
    fs.readFile('form.html', function(err, data) {
        res.writeHead(200, {
            'Content-Type' : 'text/html',
            'Content-Length': data.length 
        });
        res.write(data);
        res.end();
    });
})

app.get('/urbanfarming/img', function(req, res){
    var x = req.query.x;
    var f = req.query.f;  // if supplied then when the corresponding id image is null, then find the nearest id that has got an image. otherwise, if the image is null, then display the null image.
    if (x && x.substr(-1) == '/'){
        x = x.substr(0, x.length -1);
    }

    if (f && f.substr(-1) == '/'){
        f = f.substr(0, f.length -1);
    }
    console.log(f);
    console.log(x);
    formatImageForDisplay(req, res, x, f, (fileName)=>{
        res.sendFile(fileName);

    } );
}) 

app.get('/urbanfarming', (request, response) => {
    var index = fs.readFileSync('index.html', 'utf8');
    response.write(index);
    response.end()
})
app.get('/urbanfarming/processImage', (req, res) => {
    var x = req.query.x;
    if (x && x.substr(-1) == '/') {
        x = x.substr(0, x.length -1);
    }
    formatImageForDisplay(req,res, x, 1, (fileName)=> {
        insertIntoLayout(__dirname + "/process.html", (index) => {  
            processImage(fileName, (f) => {   
                if (f==null){
                    res.end();
                    console.log("got last entry");
                    return
                } else {
                    console.log("got data ");
                    console.log(f);
                    c = index.replace("{{image}}", "../public/foo1.JPEG"); 
                    c = c.replace("{{imageO}}", "../public/foo.jpg");
                    c = c.replace("{{score}}", f);
                    res.write(c);
                }
            });
        })
    })
})
app.get('/urbanfarming/viewcontent', (request, response) => {
    getLastXRows(request, response);
})
app.get('/urbanfarming/view', (request, response) => {
    var index = fs.readFileSync('view.html', 'utf8');
    response.write(index);
    response.end()
})
app.get('/urbanfarming/liveData',(req, res)=>{
    var o =  req.query.o;
    if (o && o.substr(-1) == '/'){
        o = o.substr(0, o.length -1);
        parseInt(o);
        console.log(o);
    }
    if (!o) {
        o = 0;
    }
    getHome(req, res, o);
})

app.get('/urbanfarming/game', (req, res) => {
    var index ='<iframe src="http://zap.pm/game/55ae4e2b7dfb285122934106/play" width="480" height="365" allowfullscreen></iframe><br> <a href="http://zap.pm/game/55ae4e2b7dfb285122934106" target=_blank>Tank Battle by roger on ZAP<br> Remix to add your own pictures and settings!</a> - See more at: http://zap.pm/game/55ae4e2b7dfb285122934106#sthash.Ptk8wWfG.dpuf';
    res.write(index);
    res.end()
})


app.get('/urbanfarming/chart', (req, res) => {
    var c;
    generateChart((c) => {displayChart(c, res)})
})
app.get('/urbanfarming/verifyemail', (req, res) => {
    insertIntoLayout(__dirname+"/pleaseVerify.html", (l)=>{
        res.write(l);
        res.end();
    });
})
app.get('/urbanfarming/verified', (req, res) => {
    insertIntoLayout(__dirname + "/thanksVerify.html", (l) => {
        res.write(l);
        res.end();
    });
})
