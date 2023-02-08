import React, { useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { phaserEvents, Event } from 'src/events/EventCenter';
import { ServerToClientEvents, ClientToServerEvents } from 'src/api/chat';
import ParasolImg from 'src/assets/directmessage/parasol.png';
import { ChatFeed, Message } from 'react-chat-ui';
import store from '../stores';
import { setNewMessageCnt, setNewMessage, setRequestFriendCnt } from 'src/stores/DMboxStore';
import Cookies from 'universal-cookie';
import { fireNotification } from 'src/api/notification';
const cookies = new Cookies();
export default class chatNetwork {
  private socketClient: Socket;
  public oldMessages: any[];

  constructor() {
    // const socketUrl = `https://www.para-solo.site`
    const socketUrl = `http://43.201.119.149:3000/`
    // const socketUrl = `http://43.201.119.149:3000/socket-server/`
    // this.socketClient = io("www.parasolo-soc.com")
    this.socketClient = io(socketUrl)
    this.socketClient.on("connect_error", (err) => {
      console.log(`connetion err${err.message}`);
      console.error(err)
      
    })
    // this.socketClient = io("https://www.para-solo.site/socket-server", {
    //   // path:'/socket/',
    //   // withCredentials: true
    // });
    this.oldMessages = [];
    
    this.socketClient.on('request-friend', (data) => {
      store.dispatch(setRequestFriendCnt(1));
      fireNotification('[PARA-SOLO] 친구 요청 도착', {
        body: `${data.username}님과 친구를 맺어보아요.`,
        icon: `${ParasolImg}`,
      });
      console.log('request-friend', data);
    });

    this.socketClient.on('accept-friend', (data) => {
      fireNotification('[PARA-SOLO] 친구 요청 수락', {
        body: `짝짝짝, ${data}님이 친구 요청을 수락했습니다.`,
        icon: `${ParasolImg}`,
      });
    });

    this.socketClient.on('message', (data) => {
      data.id = 1;
      store.dispatch(setNewMessage(data));
      store.dispatch(setNewMessageCnt(1));
    });
  }

  async getSocket () {
    return this.socketClient;
  };

  async joinRoom (roomId: string, userId: string, friendId: string, callback: any) {
    console.log('join!');
    console.log(this.socketClient)
    this.socketClient.emit('join-room', { roomId: roomId, userId: userId, friendId: friendId });

    this.socketClient.on('old-messages', (data) => {
      const userId = store.getState().user.userId || cookies.get('userId');
      this.oldMessages = [];
      data.forEach((element: any) => {
        if (element.senderId) {
          if (element.senderId === userId) {
            element.id = 0;
          } else {
            element.id = 1;
          }
          this.oldMessages.push(element);
        }
      });
      callback(this.oldMessages);
    });
  };

  async sendMessage (message: object) {
    this.socketClient.emit('message', message);
  };

  async whoAmI (userId: string) {
    console.log('myId is ....', userId);
    this.socketClient.emit('whoAmI', userId)
  };
}
