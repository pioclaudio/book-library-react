import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


class Card extends React.Component {
  render() {
    return (
      <div className="card shadow">
        <div className="float-right">
          <button type="button" className="close" aria-label="Close" data-toggle="modal" data-target="#removeBookModal"
            data-isbn={this.props.book.isbn} onClick={() => this.props.handleDeleteModalClick(this.props.book.isbn)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="card-img-div">
          <img className="card-img-top" alt="" src={"img/"+this.props.book.isbn + ".jpg"}></img>
        </div>
        <div className="card-body">
          <h4 className="card-title">{this.props.book.title}</h4>
          <p className="card-text">{this.props.book.author}</p>
          <p className="card-text">ISBN: {this.props.book.isbn}</p>
        </div>
      </div>
    )
  }
};


class CardDeck extends React.Component {

  render() {
    return (
      <div className="card-deck">
        { Object.entries(this.props.data).map( ([key, value]) => 
        <Card key={key} book={value} handleDeleteModalClick={this.props.handleDeleteModalClick}/>
        )}
        
      </div>
    );
  }

}


class DeleteModal extends React.Component {

  render() {
    if (this.props.showDeleteModal) {
      return (
          <Modal show={this.props.showDeleteModal} onHide={this.props.handleDeleteModalClick}>
            <Modal.Header closeButton>
              <Modal.Title>Remove from collection?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div class="card shadow">
                <div className="card-img-div">
                  <img className="card-img-top" alt="" src={"img/"+this.props.selectedBook.isbn + ".jpg"}></img>
                </div>
                <div className="card-body">
                  <h4 className="card-title">{this.props.selectedBook.title}</h4>
                  <p className="card-text">{this.props.selectedBook.author}</p>
                  <p className="card-text">ISBN: {this.props.selectedBook.isbn}</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.props.handleDeleteModalClick}>
                Close
              </Button>
              <Button variant="primary" onClick={this.props.handleDeleteModalClick}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
      );
    } else {
      return null;
    }
  }
}



class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeleteModalClick = this.handleDeleteModalClick.bind(this);
    this.state = {
        data: [],  
        showDeleteModal: false,
        selectedBook: null,    
    };
    
  }

  componentDidMount() {
    fetch('./bookinfo.json')
      .then(resp => resp.json())
      .then(data => {
          let dataDict = data.reduce( (dict, item) => {
            dict[item.isbn]=item;
            return dict;
          }, {});
          return this.setState({data: dataDict});
        });
  }

  deleteBook(isbn) {
    const {
      [isbn]: book,
      ...otherBooks
    } = this.setState.data;
    this.setState({
      data: otherBooks,
    });
  }

  handleDeleteModalClick(isbn) {
    let show = false;
    let selectedBook = null;
    if (isbn) {
      show = true;
      selectedBook = this.state.data[isbn];
    }
    console.log(isbn);
    this.setState({ 
      showDeleteModal: show,
      selectedBook: selectedBook,
     });
  }

  render() {
    return (
      <div className="main-container">
        <div className="header-container">
          <h2>My Library Collection</h2>
          <p>The New York Times Bestsellers October 2019</p>
        </div>
        <CardDeck data={this.state.data} handleDeleteModalClick={this.handleDeleteModalClick} />
        <DeleteModal selectedBook={this.state.selectedBook} showDeleteModal={this.state.showDeleteModal} handleDeleteModalClick={this.handleDeleteModalClick}/>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
