import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { setMovies } from '../../actions/actions';
import MoviesList from '../movies-list/movies-list';
import Menu from '../navbar/navbar';
import { LoginView } from '../login-view/login-view';
import { ProfileView } from '../profile-view/profile-view';
import { MovieCard } from '../movie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';
import { RegistrationView } from '../registration-view/registration-view';
import { DirectorView } from '../director-view/director-view';
import { GenreView } from '../genre-view/genre-view.jsx';
import { BrowserRouter as Router, Routes, Route, Redirect } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useIsRTL } from 'react-bootstrap/esm/ThemeProvider';

export class MainView extends React.Component {
  constructor() { //the place to initialize a state's values or data in memory before rendering component
    super(); //initializes component's state and enables this.state
    this.state = {
      user: null
    };
  }

  //code executed right after the component is added to the DOM
  componentDidMount() {
    let accessToken = localStorage.getItem('token');
    if (accessToken !== null) {
      this.setState({
        user: localStorage.getItem('user')
      });
      this.getMovies(accessToken);
    }
  }

  //When a user successfully logs in, this function updates the 'user' property from null to particular user
  onLoggedIn(authData) {
    console.log(authData);
    this.setState({
      //allowing the new user to have attached JWT which will be stored.
      user: authData.user.username
    });

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', authData.user.username);
    this.getMovies(authData.token);
  }

  getMovies(token) {
    axios.get('https://kh-movie-app.herokuapp.com/movies', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        //Assign the result to the state
        this.props.setMovies(response.data);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  render() {
    let { movies } = this.props;
    let { user } = this.state;
    //sets up event listener and renders Movie View
    return (
      <Router>
        <Menu user={user} />
        <Container fluid style={{ width: '100%', height: 'max-content', backgroundColor: '#1B1D24', margin: '0', padding: '0' }}>
          <Row className='main-view justify-content-md-center'>
            <Route exact path='/' render={() => {
              //If there is no user, the LoginView is rendered. If there is a user logged in, the user details are passed as a prop to the LoginView
              if (!user) return <Redirect to='/login' />
              //Before the movies have been loaded
              if (movies.length === 0) return <div className='main-view' />
              return <MoviesList movies={movies} />
            }} />

            <Route path='/login' render={() => {
              if (user) {
                return <Redirect to='/' />
              }
              return <LoginView onLoggedIn={data => this.onLoggedIn(data)} />
            }} />

            <Route path='/register' render={() => {
              if (user) return <Redirect to='/' />
              return <RegistrationView />
            }} />

            <Route path="/movies/:id" render={({ match, history }) => {
              if (!user) return <LoginView onLoggedIn={user => this.onLoggedIn(user)} />
              if (movies.length === 0) return <div className='main-view' />
              return <Col md={8}>
                <MovieView movie={movies.find(movie => movie._id === match.params.id)}
                  onBackClick={() => history.goBack()} />
              </Col>
            }} />

            <Route path='/genres/:name' render={({ match, history }) => {
              if (!user) return <LoginView onLoggedIn={user => this.onLoggedIn(user)} />
              if (movies.length === 0) return <div className='main-view' />;
              return <Col md={8}>
                <GenreView genre={movies.find(m => m.genre.name === match.params.name)}
                  movies={movies.filter(movie => movie.genre.name === match.params.name)}
                  onBackClick={() => history.goBack()} />
              </Col>
            }} />

            <Route path='/directors/:name' render={({ match, history }) => {
              if (!user) return <LoginView onLoggedIn={user => this.onLoggedIn(user)} />
              if (movies.length === 0) return <div className='main-view' />;
              return <Col md={8}>
                <DirectorView director={movies.find(m => m.director.name === match.params.name)}
                  movies={movies.filter(movie => movie.director.name === match.params.name)}
                  onBackClick={() => history.goBack()} />
              </Col>
            }} />

            <Route path={`/users/${user}`} render={({ history }) => {
              if (!user) return <Redirect to='/' />
              if (movies.length === 0) return <div className='main-view' />;
              return <Col>
                <ProfileView movies={movies} onBackClick={() => history.goBack()} />
              </Col>
            }} />
          </Row>
        </Container>
      </Router >
    );
  }
}

let mapStateToProps = state => {
  return { movies: state.movies }
}

export default connect(mapStateToProps, { setMovies })(MainView);