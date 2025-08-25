/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Eye, Trophy, Play, UserPlus } from "lucide-react";
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";
const backendURL = `https://word-imposter-backend.onrender.com/`;
const Landing = () => {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
const [role, setRole] = useState<null | string>(null)
  const [word, setWord] = useState<null | string>(null)
  const [gameStarted, setGameStarted] = useState(false)
  // Connect to socket.io server
  const connectSocket = () => {
    if (!socket.connected) socket.connect();
  };

  const handleCreateRoom = async () => {
    connectSocket();

    // Ask backend to create a room
    const res = await fetch(`${backendURL}game/create`, {
      method: "POST",
    });
    const data = await res.json();
    const newRoomCode = data.roomCode;

    setRoomCode(newRoomCode);

    // Join socket room
    socket.emit("joinRoom", {
      roomCode: newRoomCode,
      playerName: playerName || "Player",
    });

    // Listen for players update
    socket.on("updatePlayers", (playersList) => {
      setPlayers(playersList);
    });

    alert(`Room created: ${newRoomCode}`);
  };

  const handleJoinRoom = () => {
    if (!roomCode) return alert("Enter a room code");
    connectSocket();

    socket.emit("joinRoom", { roomCode, playerName: playerName || "Player" });

    socket.on("updatePlayers", (playersList) => {
      setPlayers(playersList);
    });
  };
  const handleStartGame = () => {
    if (!roomCode) return
    socket.emit("startGame", { roomCode })
  }
// Connect once
  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.on("updatePlayers", (list) => setPlayers(list))
    socket.on("assignRole", ({ role, word }) => {
      setRole(role)
      if (word) setWord(word)
    })
    socket.on("gameStarted", () => setGameStarted(true))
    socket.on("gameError", (msg) => alert(msg))

    return () => {
      socket.off("updatePlayers")
      socket.off("assignRole")
      socket.off("gameStarted")
      socket.off("gameError")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="bg-primary shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary-foreground">
            🎭 Word Imposter
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Word Imposter
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            There's an imposter amongst you! Can you find them before they fool
            everyone?
          </p>
         
          {/* Game Action Cards */}
          {!gameStarted ? (
            <> <div className="max-w-md mx-auto mb-6">
            <Input
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-center text-lg font-mono tracking-wide mb-4"
            />
          </div>
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-serif font-semibold text-card-foreground">
                  Create a Room
                </CardTitle>
                <p className="text-muted-foreground">
                  Start a new game and invite your friends
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-3 text-lg transition-all duration-300 hover:scale-105"
                  onClick={handleCreateRoom}
                >
                  Create Room
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-accent/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <UserPlus className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl font-serif font-semibold text-card-foreground">
                  Join a Room
                </CardTitle>
                <p className="text-muted-foreground">
                  Enter a room code to join the fun
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-card-foreground">
                    Room Code
                  </label>
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code..."
                    className="text-center text-lg font-mono tracking-wider"
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  className="w-full bg-accent hover:bg-primary text-accent-foreground font-semibold py-3 text-lg transition-all duration-300 hover:scale-105"
                >
                  Join Game
                </Button>
              </CardContent>
            </Card>
          </div></>
           ): (
        <div className="max-w-lg mx-auto text-center bg-card rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Game Started 🎉</h2>
          {role === "imposter" ? (
            <p className="text-red-500 font-semibold text-lg">You are the Imposter! Bluff your way out 😈</p>
          ) : (
            <>
             <p className="text-green-600 font-semibold text-lg">
              Your secret word is:
            </p>
            <h4 className="text-3xl font-bold mt-2 mb-4">{word}</h4>
            </>
           
          )}
        </div>
      )}
        </div>
        {/* Show current players */}
        {players.length > 0  && !gameStarted &&  (
          <div className="max-w-md mx-auto bg-card p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2">Players in Room:</h3>
            <ul className="space-y-1">
              {players.map((p) => (
                <li key={p.id} className="text-muted-foreground">
                  {p.name}
                </li>
              ))}
            </ul>
             {/* Start Game button visible only if you're room creator */}
          {players[0]?.id === socket.id && (
            <Button onClick={handleStartGame} className="mt-4 w-full">
              🚀 Start Game
            </Button>
          )}
          </div>
        )}
      </section>

      {/* How to Play Section */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif font-bold text-card-foreground mb-4">
                How to Play
              </CardTitle>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Word Imposter is a thrilling social deduction game where wit and
                intuition determine the winner.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">
                        Get Your Secret Word
                      </h4>
                      <p className="text-muted-foreground">
                        Each player receives a secret word - but one player gets
                        a different word!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground font-bold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">
                        Describe Without Revealing
                      </h4>
                      <p className="text-muted-foreground">
                        Take turns describing your word without saying it
                        directly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">
                        Listen and Deduce
                      </h4>
                      <p className="text-muted-foreground">
                        Pay attention to others' descriptions to spot
                        inconsistencies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground font-bold text-sm">
                        4
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">
                        Vote for the Imposter
                      </h4>
                      <p className="text-muted-foreground">
                        After discussion, everyone votes on who they think is
                        the imposter.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-sm">
                        5
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">
                        Win or Lose Together
                      </h4>
                      <p className="text-muted-foreground">
                        If the imposter is caught, everyone else wins. If not,
                        the imposter takes victory!
                      </p>
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-accent">Pro Tip</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The imposter wins by blending in perfectly. Everyone else
                      wins by working together to find the odd one out!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-card-foreground">
              Ready to play with friends?
            </span>
          </div>
          <p className="text-muted-foreground mb-6">
            Gather your group and see who can spot the imposter!
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-8 py-3 text-lg transition-all duration-300 hover:scale-105"
          >
            Start Playing Now
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
