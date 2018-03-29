import React, { Component } from 'react';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import './App.css';

const api = 'http://192.168.50.22:5000';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folders: [],
      items: [],
      item: null,
      query: ''
    };
  }

  componentDidMount() {
    this.loadFolders();
  }

  render() {
    const renderFolders = this.state.folders
      .map((folder, index) => {
        return <Folder key={index} name={folder.name} id={folder.id} loadFolder={this.loadFolder.bind(this)} />;
      });

    const renderItems = this.state.items
      .filter((item) => {
        console.log(this.state.query);
        return this.state.query === '' || item.subject.toLowerCase().includes(this.state.query);
      })
      .map((item, index) => {
        return <Item key={index} subject={item.subject} size={item.size} id={item.id} folderId={item.folderId} loadItem={this.loadItem.bind(this)} />;
      });

    const renderItemDetail = (() => {
      if (this.state.item === null) {
        return <span>No item selected</span>;
      } else {
        return <ItemDetail key={this.state.item.id} item={this.state.item} />;
      }
    })();

    return (
      <div>
        <ul>{renderFolders}</ul>
        <Search onQueryChange={this.search.bind(this)} />
        <ul>{renderItems}</ul>
        {renderItemDetail}
      </div>
    );
  }

  search(query) {
    this.setState({
      folders: this.state.folders,
      items: this.state.items,
      item: this.state.item,
      query: query.toLowerCase()
    });
  }

  loadFolders() {
    const url = api + '/folders/'; // End slash is required to prevent redirect and cors problems;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
    .then((response) => {
      return response.folders;
    })
    .then((folders) => {
      this.setState({
        folders,
        items: this.state.items,
        item: this.state.item,
        query: this.state.query
      });
    });
  }

  loadFolder(id) {
    const url = api + '/folder/' + id + '/items';
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        return response.items;
      })
      .then((items) => {
        this.setState({
          items: items.map((item) => {
            return Object.assign(item, {
              folderId: id
            });
          }),
          folders: this.state.folders,
          item: this.state.item,
          query: this.state.query
        });
      });
  }

  loadItem(folderId, id) {
    const url = api + '/folder/' + folderId + '/item/' + id;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        return response.item;
      })
      .then((item) => {
        this.setState({
          items: this.state.items,
          folders: this.state.folders,
          item,
          query: this.state.query
        });
      });
  }
}

class Folder extends Component {
  onFolderClick(id) {
    return (e) => {
      e.preventDefault();
      return this.props.loadFolder(id);
    }
  }

  render() {
    return <li>
              <a href="#" onClick={this.onFolderClick(this.props.id)}>{this.props.name}</a>
           </li>;
  }
}

class Item extends Component {
  onItemClick(folderId, id) {
    return (e) => {
      e.preventDefault();
      return this.props.loadItem(folderId, id);
    }
  }

  render() {
    return <li>
              <a href="#" onClick={this.onItemClick(this.props.folderId, this.props.id)}>{this.props.subject} ({this.props.size})</a>
           </li>;
  }
}

class ItemDetail extends Component {
  render() {
    const receiver = this.props.item.recipients[0];
    return <div>
              <h2>{this.props.item.subject}</h2>
              <ul>
                <li>Sender: {this.props.item.sender.name} ({this.props.item.sender.email})</li>
                <li>Receiver: {receiver.name} ({receiver.email})</li>
                <li>{this.props.item.received}</li>
              </ul>
              <div>{ReactHtmlParser(this.props.item.html)}</div>
            </div>;
  }
}

class Search extends Component {
  render() {
    return <div>
              <span>Search</span>
              <input type="text" onChange={(e) => { return this.props.onQueryChange(e.target.value)}} />
            </div>;

  }
}

export default App;
