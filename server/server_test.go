package server_test

import (
	"bytes"
	"context"
	"testing"
	"time"

	"github.com/raffleberry/chat/server"
	"golang.org/x/net/websocket"
)

func TestWebSocks(t *testing.T) {
	done := make(chan int, 1)
	s := server.Start(done)

	// ha, ha, ha
	time.Sleep(time.Second * 1)
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

	r := <-done
	if r != 0 {
		t.Fatalf("Server returned %d", r)
	}
}
