class IndexController {
  private rooms: { [key: string]: any } = {};

  public joinRoom(username: string, room: string) {
    if (!this.rooms[room]) {
      this.rooms[room] = {};
    }
    this.rooms[room][username] = { username };
    return this.rooms[room];
  }

  public sendMessage(room: string, username: string, message: string) {
    if (!this.rooms[room]) {
      this.rooms[room] = [];
    }
    this.rooms[room].push({ username, message });
    return { username, message };
  }

  public getChoices(room: string) {
    return this.rooms[room] || {};
  }
}

export default IndexController;