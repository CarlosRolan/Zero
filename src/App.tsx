import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();



import Home from "./pages/Home";
import ClientForm from "./pages/ClientForm";
import ClientsList from "./pages/ClientsList";
import MainMenu from './components/MainMenu';
import ExportPage from './pages/ExportPage';
import ExerciseForm from './components/exercise/ExerciseForm';
import ExercisePage from './pages/ExercisePage';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <MainMenu></MainMenu>
        <IonRouterOutlet id="main">
          <Route exact path="/home" component={Home} />
          <Route exact path="/client-form" component={ClientForm} />
          <Route exact path="/client-form/:id" component={ClientForm} />
          <Route exact path="/clients" component={ClientsList} />
          <Route exact path="/exports" component={ExportPage} />
          <Route exact path="/exercise-form" component={ExercisePage} />
          <Route exact path="/exercise-form/:id" component={ExercisePage} />
          <Redirect exact from="/" to="/home" />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;