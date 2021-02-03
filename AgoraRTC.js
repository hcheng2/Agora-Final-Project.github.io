let local = []; // stores the UIDs of local streams 
let username = "" , channelName = "";
let globalStream;
let numScreens = 0; 

let handleFail = function(err){
    console.log("Error: ", err);
};

// self video stream 
let appID = "2400b34296a64a5295504ebc9e2a741f";
let client = AgoraRTC.createClient({
        mode: "live",
        codec: "h264"    
});  
client.init(appID);

function startSelfStream(){
    numScreens++;

    username = sessionStorage.getItem("name");  
    channelName = sessionStorage.getItem("channel");

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

// self screen share
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

            screenStream.init(()=>{
                screenStream.play("self-screen");
                screenClient.publish(screenStream, handleFail);              
        }, handleFail);
    }, handleFail);
}

client.on("stream-added", function(evt){
    // close window if there are too many participants 
    if(numScreens > 3){
        alert("This channel is full. Please select a different channel");
        window.close();            
    }
    numScreens++;

    client.subscribe(evt.stream, handleFail);
});

client.on("stream-subscribed", function(evt){
        let stream = evt.stream;
        let id = String(stream.getId());
    if(!local.includes(id)) {

        addVideoStream(id);
        stream.play(id);
    }
});

function removeVideoStream(elementId) {
    numScreens--;
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

function closeWindow(){
    window.close();
}

function invite(){
    alert("Link: https://hcheng2.github.io/Agora-Final-Project.github.io/ \nChannel Name: " + channelName);
}


