import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


class Card extends React.Component {
  render() {
    return (
      <div className="card shadow">
        {
          this.props.handleDeleteButton && (
          <div className="float-right">
            <button type="button" className="close" onClick={() => this.props.handleDeleteButton(this.props.book.isbn)}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          )
        }
        <div className="card-img-div">
          <img className="card-img-top" alt="" src={this.props.book.imgURL}></img>
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
        <Card key={key} book={value} handleDeleteButton={this.props.handleDeleteButton}/>
        )}
        
      </div>
    );
  }

}


class DeleteBookModal extends React.Component {

  render() {
    return (
      <Modal show={this.props.selectedBook!=null} onHide={this.props.handleDeleteModalClick}>
        <Modal.Header closeButton>
          <Modal.Title>Remove from collection?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card book={this.props.selectedBook}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleDeleteModalClick}>
            Close
          </Button>
          <Button variant="primary" onClick={e => this.props.handleDeleteModalClick(e, this.props.selectedBook.isbn)}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class FormRow extends React.Component {
  render () {
    return (
      <div className="form-group row">
        <label htmlFor={this.props.id}  className="col-sm-2 col-form-label">{this.props.label} </label>
        <div className="col-sm-10">
          <input type="text" className="form-control" id={this.props.id} placeholder={this.props.label}></input>
        </div>
      </div>      
    );
  }
}

class AddBookModal extends React.Component {
  handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;
// eslint-disable-next-line
    for (let i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) {
            continue;
        }
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                var span = document.createElement('span');
                span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'].join('');
                let dropZone = document.getElementById('drop-zone');
                dropZone.innerHTML = "";
                dropZone.insertBefore(span, null);
            };
        })(f);
        reader.readAsDataURL(f);
    }
  }

  handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  render() {
    return (
      <Modal show={this.props.showAddModal} onHide={this.props.handleAddButton}>
        <Modal.Header closeButton>
          <Modal.Title>Add new book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <form id="book-form" action="" method="POST">
              <FormRow id={'formBookTitle'} label='Title'/>
              <FormRow id={'formBookAuthor'} label='Author'/>
              <FormRow id={'formBookIsbn'} label='ISBN'/>
              <div id="drop-zone" onDragOver={this.handleDragOver} onDrop={this.handleFileSelect}>Drop book image here</div>
            </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleAddButton}>
            Close
          </Button>
          <Button variant="primary" onClick={e => this.props.handleAddButton(e,'add')}>
            Add Book
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeleteButton = this.handleDeleteButton.bind(this);
    this.handleDeleteModalClick = this.handleDeleteModalClick.bind(this);
    this.handleAddButton = this.handleAddButton.bind(this);
    this.state = {
        data: [],  
        selectedBook: null,
        showAddModal: false, 
    };
    
  }

  componentDidMount() {
    fetch('./bookinfo.json')
      .then(resp => resp.json())
      .then(data => {
          let dataDict = data.reduce( (dict, item) => {
            item['imgURL'] = "img/"+item.isbn + ".jpg"
            dict[item.isbn]=item;
            return dict;
          }, {});
          return this.setState({data: dataDict});
        });
  }

  handleDeleteModalClick(evt, isbn) {
    const {
      [isbn]: book,
      ...otherBooks
    } = this.state.data;
    this.setState({
      data: otherBooks,
      selectedBook: null,
    });
  }

  handleDeleteButton(isbn) {
    let selectedBook = isbn?this.state.data[isbn]:null;
    this.setState({ selectedBook: selectedBook});
  }


  handleAddButton(evt, mode) {
    if(mode) {
      let title = document.getElementById('formBookAuthor').value;
      let author =  document.getElementById('formBookTitle').value;
      let isbn =  document.getElementById('formBookIsbn').value;
      let read = false;
      let numPages = '';
      let thumbnail = document.querySelector(".thumb");
      let imgURL = thumbnail?thumbnail.src:'';
      let book = {title, author, isbn, read, numPages, imgURL};
      this.setState({ data: {[isbn]: book,...this.state.data} });
    }
    this.setState({ showAddModal: !this.state.showAddModal});
  }


  render() {
    return (
      <div className="main-container">
        <div className="header-container">
          <h2>My Library Collection</h2>
          <p>The New York Times Bestsellers October 2019</p>
        </div>
        <CardDeck data={this.state.data} handleDeleteButton={this.handleDeleteButton} />
        { this.state.selectedBook &&
          <DeleteBookModal selectedBook={this.state.selectedBook}  handleDeleteModalClick={this.handleDeleteModalClick}/>
        }
        {this.state.showAddModal&&<AddBookModal showAddModal={this.state.showAddModal} handleAddButton={this.handleAddButton}/>}
        <button type="button" className="fab btn-primary" onClick={this.handleAddButton}>
          <span>&#x2b;</span>
        </button>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
