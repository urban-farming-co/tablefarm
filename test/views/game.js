var expect   = require("chai").expect
var fs       = require("fs");
var request  = require("request");
var server   = require("../../server");
var livedata = require("../../Functions/Database/viewInformation")
var database = require("../../Functions/Database/checkAndCreate")
var general  = require("./general");


describe ("game page", () =>{
    var livedataurl = "http://localhost:4000/urbanfarming/livedata";
    var insertdataurl = "http://localhost:4000/urbanfarming/data";
    var gameurl = "http://localhost:4000/urbanfarming/game/";

    describe("the website works.", () => {
        it ("locally returns status 200", (done) =>{
            general.requestURL(gameurl, done);
        })
        it ("AJAX works", ()  => {

        })
        it ("integrates well with data insertion without image", () => {

        })
        it ("integrates well with data insertion with image", () => {

        })
    })
})

