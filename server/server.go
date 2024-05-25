package server

import (
	"fmt"
	"io"
	"net"
	"net/http"

	"golang.org/x/net/websocket"
)

func EchoServer(ws *websocket.Conn) {
	io.Copy(ws, ws)
}

// adds web sockets funcitonality to default serve mux
func AddWebSocks() {
	http.Handle("/echo", websocket.Handler(EchoServer))
}

// start a http server and add web socks to it
func Start() (<-chan bool, *http.Server) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Hello")
	})

	AddWebSocks()

	ready := make(chan bool, 1)

	server := http.Server{Addr: ":8080"}
	go func() {
		defer close(ready)

		l, err := net.Listen("tcp", ":8080")

		if err != nil {
			panic(err)
		}

		ready <- true

		err = server.Serve(l)

		if err != nil && err != http.ErrServerClosed {
			fmt.Println(err.Error())
		}
	}()

	return ready, &server
}
