const uuidv4 = require('uuid/v4');

module.exports = function(server) {
    //방정보
    var rooms = [];

    var io = require('socket.io')(server, {
        transports: ['websocket'],
    });

    io.on('connection', function(socket) {
        console.log('Connected: ' + socket.id);

        if (rooms.length > 0)  {
            var rId = rooms. shift();
            socket.join(rId,function(){
               // console.log("JOINROOM: " + rId);
                socket.emit('joinRoom',{room:rId});
                io.to(rId).emit('startGame');    
                //rID 익명함수
            // 조인하고 나면 ??
            });
        } else{
            var roomName = uuidv4();
            socket.join(roomName,function(){
                //??
                socket.emit('createRoom',{room:roomName});
                rooms.push(roomName);    
                
            });
        }

        socket.on('disconnecting', function(reson) {
            console.log('Disconnected:' + socket.id);
            //io.emit()
            //socket.rooms  //자신이 참여하고 있는 모든방의 정보 
        
           // var socketRooms = Object.keys(socket.rooms).filter(function(item){
              //  item != socket.id;
              var socketRooms = Object.keys(socket.rooms).filter((item) => item != socket.id) //{ //function(item)
                  //if(item != socket.id){
                  //    return true;
                //  }else{
                  //    return false;
                  //}
            //});

            //console.dir(socketRooms);
            socketRooms.forEach(function(room){
                socket.broadcast.to(room).emit('exitRoom');

                //혼자 만든방의 유저가 disconnect되면 해당 방 제거 
                var idx = room.indexOf(room);//indexOf번호를 반환해라
                if (idx != -1)//-1 인덱스에서 못찾으면  -1
                {
                    rooms.splice(idx,1) // array 에서 방을 1개 지워라 
                }
            })

        });

        socket.on('doPlayer',function(playerInfo){
            var roonId = playerInfo.room;
            var cellIndex = playerInfo.position;
        
           socket.broadcast.to('방이름') 
           socket.broadcast.to(roonId).emit('doOpponent', { position: cellIndex });

        });

        socket.on('message', function(msg) {
            console.dir(msg);
            socket.broadcast.emit('chat', msg);
        });
    });
};