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

// 1 -- Create AgoraRTC object
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
    client.join(null, channelName, username, ()=>{
        let localStream = AgoraRTC.createStream({
            audio: true,
            video: true,
        });
        localStream.init(()=>{
              localStream.play("self-stream");
              client.publish(localStream, handleFail);               // UNCOMMENT THIS!!!
        }, handleFail);
        globalStream = localStream;
    }, handleFail);

    client.on("stream-added", function(evt){
        // close window if there are too many participants 
        if(numParticipants > 1){
            alert("This channel is full. Please select a different channel");
            window.close();            
        }
        numParticipants++;

        client.subscribe(evt.stream, handleFail);
    });
    
    client.on("stream-subscribed", function(evt){
        let stream = evt.stream;
        let streamId = String(stream.getId());
        addVideoStream(streamId);
        stream.play(streamId);
    });
    
}


// WRITE MYSELF --------> 

// or client.leave();   ????


// Remove the video stream from the container.
function removeVideoStream(elementId) {
    numParticipants--;
    let remoteDiv = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};
// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
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


function shareScreen(){
    // Check if the browser supports screen sharing without an extension.
   // Number.tem = ua.match(/(Chrome(?=\/))\/?(\d+)/i);
   // if(parseInt(tem[2]) >= 72  && navigator.mediaDevices.getDisplayMedia ) {
    // Create the stream for screen sharing.
        screenStream = AgoraRTC.createStream({
            streamID: String(globalStream.getId()),
            audio: false,
            video: false,
            screen: true,
        });
   // }
}

function closeWindow(){
    window.close();
}

function invite(){
    alert("Link: __________________________ \nChannel Name: " + channelName);
}