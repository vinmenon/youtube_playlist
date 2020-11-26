'use strict';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {library: {}};
  }

  componentDidMount() {
    const client_id = '70292393840-cv1ve9j8g9tn1jseauv9ca48a4akvnpp.apps.googleusercontent.com';
    gapi.load("client:auth2", function() {
      gapi.auth2.init({client_id});
    });
    setTimeout(() => this.authenticate().then(this.loadClient), 1000);
  }

  authenticate() {
    return gapi.auth2.getAuthInstance()
      .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
      .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); })
  }

  loadClient() {
    gapi.client.setApiKey("AIzaSyBdrCn-rfDo994ADE8lp1la7-KKMR2gZNQ");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function() { console.log("GAPI client loaded for API"); },
            function(err) { console.error("Error loading GAPI client for API", err); });
  }

  execute(str, num = 10) {
    return gapi.client.youtube.search.list({
      "part": [
        "snippet"
      ],
      "maxResults": num,
      "q": str
    })
    .then(resp => {
      let { library } = this.state;
      library[str] = resp.result.items; // add to list
      this.setState({library});
    }, err => console.error("Execute error", err));
  }

  inputChange(event) {
    const searchStr = event.target.value;
    const { library } = this.state;
    if (library[searchStr]) return;
    if(event.key === 'Enter') {
      this.execute(event.target.value);
    }
  }

  removeItem(event) {
    const { library } = this.state;
    const key = event.target.parentElement.id;
    delete library[key];
    this.setState(library);
  }

  showMore(event) {
    const { library } = this.state;
    const key = event.target.parentElement.id;
    const num = library[key].length;
    this.execute(key, num + 10);
  }

  render() {
    const { library } = this.state;
    return (
      <div id="app">
        <div className="navbar">
          <input type="text" onKeyPress={this.inputChange.bind(this)} placeholder="Enter search key here"/>
        </div>
        <div className="bgImg"/>
        {Object.keys(library).map((key, idx) => {
          const items = library[key];
          return (
            <div id={key} key={`playlist${idx}`} className="playlistContainer">
              <button onClick={this.removeItem.bind(this)}>REMOVE</button>
              <button onClick={this.showMore.bind(this)}>SHOW MORE</button>
              <div className="playlist">
                {items.map((item, idx) => <iframe key={`playlistThumb${idx}`} src={`https://www.youtube.com/embed/${item.id.videoId}?enablejsapi=1`} width="640" height="360"/>)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);