import React, { useEffect, useState } from "react";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { authUser } = useAuthStore();
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const initCall = async () => {
      try{

        const res = await axiosInstance.get("/video/token", { withCredentials: true });
        
        const token = res.data.token;

        if (!token || !authUser || !callId) return;
        
        const [id1,id2] = callId.split("-");
        if (joined){
          // toast.error("You have already joined this call.");
          return;
        }
        if (id1 !== authUser._id && id2 !== authUser._id) {
          toast.error("You are not authorized to join this call.");
          return;
        }

        console.log("Initializing call with ID:", callId, " ", "User:", authUser);
        
        
        console.log("Initializing Stream video client...");
        
        
        const user = {
          id: authUser._id,
          name: authUser.name,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: token,
        });

        const callInstance = videoClient.call("default", callId);
        
        await callInstance.join({ create: true });
        
        console.log("Joined call successfully");
        
        setClient(videoClient);
        setCall(callInstance);
        setJoined(true);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [authUser, callId,joined]);

  //   if (isLoading || isConnecting) return <PageLoader />;
  if (isConnecting) return <div>Loading.....</div>;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent setJoined={setJoined} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = ({setJoined}) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();
  
  if (callingState === CallingState.LEFT) {
    setJoined(false);
    return navigate("/");
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
