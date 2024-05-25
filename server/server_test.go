package server_test

import (
	"bytes"
	"context"
	"testing"

	"github.com/raffleberry/chat/server"
	"golang.org/x/net/websocket"
)

func TestWebSocks(t *testing.T) {
	ready, s := server.Start()

	<-ready
	// -->
	origin := "http://localhost/"
	url := "ws://localhost:8080/echo"
	ws, err := websocket.Dial(url, "", origin)
	if err != nil {
		t.Fatal(err)
	}

	sent := []byte("hello, world!")

	if _, err := ws.Write(sent); err != nil {
		t.Fatal(err)
	}

	var msg = make([]byte, 512)
	var n int

	if n, err = ws.Read(msg); err != nil {
		t.Fatal(err)
	}
	recv := msg[:n]

	if bytes.Equal(sent, recv) {
		t.Logf("OK - sent: %s, recv: %s", sent, recv)
	} else {
		t.Fatalf("Fail - sent: %s, recv: %s", sent, recv)
	}

	// <--

	s.Shutdown(context.Background())

}
