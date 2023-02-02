import './App.css';
import React, {useState} from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

function App() {
    const [tick, setTick] = useState({
        "0_0": "#",
        "0_1": "#",
        "0_2": "#",
        "1_0": "#",
        "1_1": "#",
        "1_2": "#",
        "2_0": "#",
        "2_1": "#",
        "2_2": "#",
    });
    const [login, setLogin] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameOn, setGameOn] = useState(false);
    const [playerType, setPlayerType] = useState(null);

    let turns = [["#", "#", "#"], ["#", "#", "#"], ["#", "#", "#"]];
    let turn = "";

    const url = 'http://localhost:8080';
    let stompClient;

    const connectToSocket = (gameId) => {

        console.log("connecting to the game");
        let socket = new SockJS(url + "/gameplay");
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log("connected to the frame: " + frame);
            stompClient.subscribe("/topic/game-progress/" + gameId, function (response) {
                let data = JSON.parse(response.body);
                console.log(data);
                displayResponse(data);
            })
        })
    }
    const connectToRandom = () => {
        let login = document.getElementById("login").value;
        if (login == null || login === '') {
            alert("Please enter login");
        } else {
            fetch(url + "/game/connect/random", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "login": login
                })
            }).then(res => res.json())
                .then(data => {
                    setGameId(data.gameId);
                    setPlayerType('O');
                    turns = [["#", "#", "#"], ["#", "#", "#"], ["#", "#", "#"]];
                    connectToSocket(gameId);
                    alert("Congrats you're playing with: " + data.player1.login);
                    setGameOn(true);
                })
                .catch(err => console.error(err));
        }
    }
    const create_game = () => {
        if (login == null || login === '') {
            alert("Please enter login");
        } else {
            fetch(url + "/game/start", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "login": login
                })
            }).then(res => res.json())
                .then(data => {
                    setGameId(data.gameId);
                    setPlayerType('X');
                    turns = [["#", "#", "#"], ["#", "#", "#"], ["#", "#", "#"]];
                    connectToSocket(gameId);
                    alert("Your created a game. Game id is: " + data.gameId);
                    setGameOn(true);
                })
                .catch(err => console.error(err));
        }
    }

    const handleConnectToGame = () => {
        fetch(url + "/game/connect", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                player: {
                    login
                },
                gameId
            })
        }).then(res => res.json())
            .then(data => {
                setPlayerType('O');
                turns = [["#", "#", "#"], ["#", "#", "#"], ["#", "#", "#"]];
                connectToSocket(gameId);
                alert("Congrats you're playing with: " + data.player1.login);
                setGameOn(true);
            })
            .catch(err => console.error(err));

    }


    const makeAMove = (type, xCoordinate, yCoordinate) => {
        fetch(url + "/game/gameplay", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "type": type,
                "coordinateX": xCoordinate,
                "coordinateY": yCoordinate,
                "gameId": gameId
            })
        }).then(response => response.json())
            .then(jsonData => {
                setGameOn(false);
                displayResponse(jsonData.result);
            }).catch(err => console.error(err));
    }

    const displayResponse = (data) => {
        let board = data.board;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === 1) {
                    turns[i][j] = 'X'
                } else if (board[i][j] === 2) {
                    turns[i][j] = 'O';
                }
                let id = i + "_" + j;
                tick[id] = turns[i][j];
            }
        }
        if (data.winner != null) {
            alert("Winner is " + data.winner);
        }
        setGameOn(true);
    }

    const playerTurn = (turn, tickId) => {
        if (gameOn) {
            const spotTaken = tick[tickId];
            if (spotTaken === "#") {
                makeAMove(playerType, tickId.split("_")[0], tickId.split("_")[1]);
            }
        }
    }

    const ticClickHandler = (event) => {
        playerTurn(turn, event.target.id);
    }

    const handleLoginChange = (event) => {
        setLogin(event.target.value);
    }

    const handleGameIdChange = (event) => {
        setGameId(event.target.value);
    }

    return (
        <div className="App" id="box">
            <header>
                <h1>Play Tic Tac Toe</h1>
            </header>
            <input onChange={handleLoginChange} value={login} id="login" placeholder="Place a login here"/>
            <button onClick={create_game}>Create a new game</button>
            <button onClick={connectToRandom}>Connect to random game</button>
            <input onChange={handleGameIdChange} value={gameId} id="game_id" placeholder="Paste game id"/>
            <button onClick={handleConnectToGame}>Connect by game id</button>
            <div id="message"></div>
            <ul id="gameBoard">
                <li id="0_0" value={tick["0_0"]} className="tic" onClick={ticClickHandler}>{tick["0_0"]  === '#' ? '' : tick["0_0"]}</li>
                <li id="0_1" value={tick["0_1"]} className="tic" onClick={ticClickHandler}>{tick["0_1"]  === '#' ? '' : tick["0_1"]}</li>
                <li id="0_2" value={tick["0_2"]} className="tic" onClick={ticClickHandler}>{tick["0_2"]  === '#' ? '' : tick["0_2"]}</li>
                <li id="1_0" value={tick["1_0"]} className="tic" onClick={ticClickHandler}>{tick["1_0"]  === '#' ? '' : tick["1_0"]}</li>
                <li id="1_1" value={tick["1_1"]} className="tic" onClick={ticClickHandler}>{tick["1_1"]  === '#' ? '' : tick["1_1"]}</li>
                <li id="1_2" value={tick["1_2"]} className="tic" onClick={ticClickHandler}>{tick["1_2"]  === '#' ? '' : tick["1_2"]}</li>
                <li id="2_0" value={tick["2_0"]} className="tic" onClick={ticClickHandler}>{tick["2_0"]  === '#' ? '' : tick["2_0"]}</li>
                <li id="2_1" value={tick["2_1"]} className="tic" onClick={ticClickHandler}>{tick["2_1"]  === '#' ? '' : tick["2_1"]}</li>
                <li id="2_2" value={tick["2_2"]} className="tic" onClick={ticClickHandler}>{tick["2_2"]  === '#' ? '' : tick["2_2"]}</li>
            </ul>
            <div className="clearfix"></div>
            <footer>
                <span>You are playing with <span id="oponentLogin"></span></span>
            </footer>
        </div>
    );
}

export default App;
