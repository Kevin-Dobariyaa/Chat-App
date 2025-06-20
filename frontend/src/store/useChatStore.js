/* eslint-disable no-unused-vars */
import {create} from 'zustand';
import toast from 'react-hot-toast';
import {axiosInstance} from '../lib/axios.js'
import {useAuthStore} from './useAuthStore.js';
export const useChatStore = create((set,get)=>({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    isMessageSend: false,

    getUsers: async () => {
        set({isUserLoading: true});
        try {
            const response = await axiosInstance.get('/messages/users');
            set({users: response.data});
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        }finally {
            set({isUserLoading: false});
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
        } catch (error) {
        toast.error(error.response.data.message);
        } finally {
        set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) =>{
        const {selectedUser, messages} = get();
        set({isMessageSend: true});
        try{
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, response.data]});
        }catch (err) {
            toast.error('Image size should be less than 1MB');
        }finally{
            set({isMessageSend: false});
        }
    },

    subscribeToMessage: () => {
        const {selectedUser} = get();
        if(!selectedUser) return;
        
        const socket = useAuthStore.getState().socket;


        socket.on("newMessage", (newMessage) => {
            // Check if the new message is for the selected user
            // and if the senderId matches the selectedUser's id
            // then there no need to update the messages state
            if(newMessage.senderId !== selectedUser._id) return;
            set({messages: [...get().messages, newMessage]});
        });
    },

    unsubscribeFromMessage: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user) => {
        set({selectedUser: user}); 
    },
}));