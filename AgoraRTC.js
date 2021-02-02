let local = []; // stores the UIDs of local streams 

let handleFail = function(err){
    console.log("Error: ", err);
};

let participants = "";
let numRemote = 0;

let numParticipants = 0;

let remoteContainer = document.getElementById("remote-stream");

// adds participant to list of participants
function addParticipant(name){
    participants += name;
    participants += "<br>";

   document.getElementById("participants").innerHTML = participants;    
}

let appID = "2400b34296a64a5295504ebc9e2a741f";
let client = AgoraRTC.createClient({
        mode: "live",
        codec: "h264"    
});  
client.init(appID);

let username = "" , channelName = "";

let globalStream;


function startSelfStream(){
    numParticipants++;

    username = sessionStorage.getItem("name");  
    channelName = sessionStorage.getItem("channel");

//    addParticipant(username);

    // 2--join
    client.join(null, channelName, null, (uid)=>{
        let localStream = AgoraRTC.createStream({
            audio: true,
            video: true,
        });
        local.push(String(uid));

        localStream.init(()=>{
              localStream.play("self-stream");
              client.publish(localStream, handleFail);              
        }, handleFail);
        globalStream = localStream;
    }, handleFail);
    
}

let screenClient = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"  
});
screenClient.init(appID);

let screenId ="";

function shareScreen(){
        screenClient.join(null, channelName, null, (uid)=>{
            let screenStream = AgoraRTC.createStream({
                streamID: username,
                audio: false,
                video: false,
                screen: true,
            });
            screenId = String(uid);
            local.push(String(uid));
        //    alert(local);
            
            screenStream.init(()=>{
                screenStream.play("self-screen");
                screenClient.publish(screenStream, handleFail);              
        }, handleFail);
    }, handleFail);
}
/*
screenClient.on("stream-added", function(evt){
    
    alert("screen added 1");

});

screenClient.on("stream-subscribed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    if(!localStreams.includes(streamId)) {
        screenClient.subscribe(evt.stream, handleFail);

        addScreenStream(streamId);
        stream.play(streamId);    
    }



});*/


client.on("stream-added", function(evt){
    // close window if there are too many participants 
    if(numParticipants > 3){
        alert("This channel is full. Please select a different channel");
        window.close();            
    }
    numParticipants++;

    client.subscribe(evt.stream, handleFail);
});

client.on("stream-subscribed", function(evt){


        let stream = evt.stream;
        let id = String(stream.getId());
    //  alert(streamId);
  //  alert(local + " " + id + " "+ !(local.includes(id)));

    if(!local.includes(id)) {

        addVideoStream(id);
        stream.play(id);
    }
});




function closeWindow(){
    window.close();
}

function invite(){
    alert("Link: https://hcheng2.github.io/Agora-Final-Project.github.io/ \nChannel Name: " + channelName);
}


function removeVideoStream(elementId) {
    numParticipants--;
    let remoteDiv = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};

client.on("stream-removed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});

client.on("peer-leave", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});


let isaudioMuted = false;
let isVideoMuted = false;


function stopVideo(){
    if(!isVideoMuted){
        globalStream.muteVideo();
        isVideoMuted = true;
    }
    else{
        globalStream.unmuteVideo();
        isVideoMuted = false;
    }
}

function mute(){
    if(!isaudioMuted){
        globalStream.muteAudio();
        isaudioMuted = true;
    }
    else{
        globalStream.unmuteAudio();
        isaudioMuted = false;
    }
}


