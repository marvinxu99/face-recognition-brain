import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import './App.css';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';


const particleOptions = {
  particles: {
    number: {
      value: 70,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

const initialState = {
	urlInput: '',
    imageUrl2: "",
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      urlInput: '',
      imageUrl2: "",
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  //componentDidMount() {
  //  fetch('http://localhost:3001')
  //    .then(response => response.json())
  //    //.then(data => console.log(data))
  //    .then(console.log)
  //}

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }});
  }

  calculateFaceLocation = (data) => {
      var clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      //console.log(clarifaiFace);
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      //console.log(width, height);
      return {   
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width), 
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) =>{
	if(event.target.value) {  
		this.setState({ urlInput: event.target.value });
	}
  }

  onButtonClick = () => {
    this.setState({ imageUrl2: this.state.urlInput });
	fetch('http://localhost:3001/imageurl', {
		method: 'post',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			urlInput: this.state.urlInput
		})
	})
	.then(response => response.json())
      .then(response => {
        if(response) {
          fetch('http://localhost:3001/image', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count })) 
          })
		  .catch(console.log)

          this.displayFaceBox(this.calculateFaceLocation(response))
        }
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (to_route) => {
    if (to_route === 'home') {
      this.setState({ isSignedIn: true });
    } else {
      this.setState(initialState);	  
    }

    this.setState({ route: to_route });
  }

  render() {
    const { isSignedIn, imageUrl2, route, box } = this.state; 
    const { name, entries} = this.state.user;

    return (
      <div className="App">
        <Particles className='particles' 
          params={ particleOptions } 
        />
        <Navigation isSignedIn={ isSignedIn } onRouteChange={ this.onRouteChange } />        
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={ name } entries={ entries } />
              <ImageLinkForm 
                onInputChange={ this.onInputChange } 
                onSubmitClick={ this.onButtonClick } 
              />
              <FaceRecognition box={ box } imageUrl={ imageUrl2 } />
            </div>
          : ( route === 'signin'
                ? <SignIn loadUser={ this.loadUser } onRouteChange={ this.onRouteChange } />
                : <Register loadUser={ this.loadUser } onRouteChange={ this.onRouteChange } />
            )
          }
      </div>
    );
  }
}

export default App;
