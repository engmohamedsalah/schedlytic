import Router, { useRouter } from 'next/router';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/editor.css'
import '../styles/globals.css'
import Layout from '../components/Layout' 
import { Provider } from "react-redux";
import { store, persistor } from '../redux/store';
import { PersistGate } from 'redux-persist/integration/react' 
import NextNProgress from 'nextjs-progressbar';


function MyApp({ Component, pageProps }) {
  if (typeof window !== "undefined") {
    require("jquery");
  }
  
  const router = useRouter()

  return ( 
    <Provider store={store}>
      <NextNProgress 
          color="#ff7f69"
          height={3}
          showOnShallow={true}
      />

      <PersistGate loading={null} persistor={persistor}> 
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PersistGate>
    </Provider>
  )
}

export default MyApp

