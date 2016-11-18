var titleID = "DF78";
var secretKey = "7EKB53HCE5XACZD644IFFIUU4RP1QRP3YMOFDP5Z593BCH8544";

var url =  "https://DF78.playfabapi.com/Client/"; 
var regAPI = url + "RegisterPlayFabUser";
var updAPI = url + "UpdateUserData";
var logAPI = url + "LoginWithPlayFab";

$("#submitReg").click(function(){
    isValid = $("#email")[0].checkValidity() && 
        $("#type")[0].checkValidity() && 
        $("#username")[0].checkValidity() && 
        $("#password")[0].checkValidity();
    if (!isValid){
        alert("Something is wrong! \nPlease check that you've entered the correct data.")
            return;
    }

    var email = $("#email").val();
    var username = $("#username").val();
    var displayname = $("#displayname").val();
    var type = $("#type").val();
    var password = $("#password").val();
    var deviceID = $("#deviceID").val();
    var plantspecies = $("#plantspecies").val();
    var plantname = $("#plantname").val();

    Register(username,displayname, password,email, function(err, data){
        if (err){
            alert("something went wrong.\n" + JSON.stringify(err.error));
        }

        else{
            var user_session_ticket_value = 0; 
            try{
                user_session_ticket_value = data.data.SessionTicket;
            }catch(err){
                user_session_ticket_value = JSON.parse(data.responseText).data.SessionTicket;
            }
            console.log(user_session_ticket_value);
            setAdditionalParameters(deviceID, plantspecies, plantname, type, user_session_ticket_value, function(err, data){
                if (err){
                    alert("something went wrong.\n" + err);
                }
                else{
                    window.location = "../userHome";
                }

            });
        }
    });
})

$("#submitLog").click(function(){
    console.log("tah");
    alert("thanks paul");
    var username = $("#username").val();
    var password = $("#password").val();
    Authenticate(username, password, function(err, data) {
        if (err){
            alert("something went wrong.\n" + JSON.stringify(err));
        }else{
            window.location = "../userHome";
        }
    });
})


function Register(name,displayname, password, email, callback){
    console.log(regAPI);
    var headers = {"Content-Type": "application/json"};
    var data  = {
        "TitleId": titleID,
        "Username": name,
        "DisplayName":displayname,
        "Email": email,
        "Password": password
    };
    console.log(JSON.stringify( data));
    $.ajax({
        type: "POST",
        url: regAPI, 
        data: JSON.stringify( data),
        complete: function(data, status){
            console.log(data);
            console.log("...");
            console.log(JSON.parse(data.responseText))
                callback(null, data);
        },
        error: function(err, dko){
            console.error(err);
            callback(JSON.parse(err.responseText));
        },
        contentType: "application/json",
        dataType:  "json"
    });

}


function setAdditionalParameters(deviceID, plantspecies, plantname, userType, user_session_ticket_value, callback){
    var headers = {"Content-Type": "application/json"};
    headers["X-Authentication"]= user_session_ticket_value ;
    console.log(headers);
    var data =  {
        "Data": {
            "deviceID": deviceID,
            "plantSpecies": plantspecies,
            "plantName": plantname,
            "userType":userType
        },
        "Permission": "Public"
    }
    $.ajax({
        type: "POST",
        url: updAPI, 
        data: JSON.stringify( data),
        complete: function(data, status){
            callback(null, JSON.parse(data.responseText));
        },
        error: function(err, dko){
            console.error(err);
            callback(JSON.parse(err.responseText));
        },
        headers: headers,
        dataType:  "json"
    });
}

function Authenticate(username, password, callback)
{
    //save our local GUID and Title Id so we use the same one (or at least until our cookies are cleared)
    localStorage.titleId = $("#inputTitleId").val();
    var headers = {"Content-Type": "application/json"};
    data = 
    {
        "TitleId": titleID,
        "Username": username,
        "Password": password
    }
    console.log(data)

        console.log("Logging into PlayFab...");
    $.ajax({
        type: "POST",
        url: logAPI, 
        data: JSON.stringify( data),
        complete: function(data, status){
            callback(null, JSON.parse(data.responseText));
        },
        error: function(err, dko){
            console.error(err);
            callback(JSON.parse(err.responseText));
        },
        headers: headers,
        dataType:  "json"
    });

}

