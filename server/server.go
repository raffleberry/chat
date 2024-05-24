package server

import (
	"fmt"
	"io"
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
//
// done = 1, if any error
//
// done = 0, no error
func Start(done chan<- int) *http.Server {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Hello")
	})

	AddWebSocks()

	server := http.Server{Addr: ":8080"}

	go func() {
		err := server.ListenAndServe()

		if err != nil && err != http.ErrServerClosed {
			fmt.Println(err.Error())
			done <- 1
		}
		done <- 0
	}()

	return &server
}
