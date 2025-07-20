import { Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser,sendMessage, updateMessage } = useChatStore();
  const { onlineUsers,authUser } = useAuthStore();
  const handleVideoCall = async (e) => {
    
    e.preventDefault();
    
    const channelId = [authUser._id, selectedUser._id].sort().join("-");
    

    try {
      let id = await sendMessage({
        text: channelId,
        type: "video",
      });
      toast.success("Video call initiated");

      setTimeout(async () => {
        try {
          await updateMessage(id, {
            type: "endVideo",
            text: "Video call ended",
          });
        } catch (updateErr) {
          console.error("Update failed:", updateErr);
        }
      }, 10000);
      
    } catch (err) {
      toast.error("Failed to video call");
      console.error("Failed to video call:", err);
    }
  };
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.name} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Video onClick={handleVideoCall}/>
          <button onClick={() => setSelectedUser(null)} className="cursor-pointer p-1 rounded-full hover:bg-base-300 transition-colors">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;