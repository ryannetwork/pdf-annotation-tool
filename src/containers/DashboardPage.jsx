import React from 'react';
import Auth from '../modules/Auth';
import PdfUploadForm from '../components/PdfUploadForm.jsx';
import { getws } from './../WebSocket'
import MyLocalize from '../modules/Localize';
import fileDownload from 'js-file-download';
import PropTypes from 'prop-types';

class DashboardPage extends React.Component {

  /**
   * Class constructor.
   */

  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      pdfAr:[]
    };
  }

  /*
  openPdf = (id,pdf) => {
    window.location = "/pdf?url="+pdf+"&id="+id;
  };
  */

  /**
   * This method will be executed after initial rendering.
   */
   goPDFInfo = (event,pdf_id,history) =>{
     event.stopPropagation();
     history.push("/pdfInfo?id="+pdf_id);
   }

   downloadPDF = (event,path,downloadName)=>{
     event.stopPropagation();
     console.log('Call download');
     // Send in API
     var requestUrl = '/api/downloadFile?path='+path+'&downloadname='+downloadName;
     var xhr = new XMLHttpRequest();
     xhr.open("GET", requestUrl);
     xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
     xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
     xhr.responseType = "arraybuffer";
     xhr.onload = function () {
        if (this.status === 200) {
          var blob = new Blob([xhr.response], {type: "application/pdf"});
          //var objectUrl = URL.createObjectURL(blob);
          //window.open(objectUrl);
          fileDownload(blob, downloadName);
        }
     };
     xhr.send();
   }

  deletePDF = (event,id,path) => {
    event.stopPropagation();
    console.log('Call delete pdf');
    // Save in API
    var self = this;
    if (window.confirm("Do you really want to delete?")) {
      var requestUrl = '/api/deletePDF?id='+id+"&path="+path;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", requestUrl);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
      xhr.responseType = "arraybuffer";
      xhr.onload = function () {
        if (this.status === 200) {
          self.loadAllPDF();
        }
      };
      xhr.send();
    }
  }

  downloadPDFAnnotated = (event,id,path,downloadName) => {
    event.stopPropagation();
    console.log('Call download annotated');
    // Send to API
    var requestUrl = '/api/downloadAnnotatedFile?id='+id+'&path='+path+'&downloadname='+downloadName;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
       if (this.status === 200) {
         var blob = new Blob([xhr.response], {type: "application/pdf"});
         //var objectUrl = URL.createObjectURL(blob);
         //window.open(objectUrl);
         fileDownload(blob, downloadName);
       }
    };
    xhr.send();
  }

  loadAllPDF = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/getAllPDF');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        console.log('Is array:',Array.isArray(xhr.response));
        console.log('All pdfs upload',xhr.response);
        this.setState({
          pdfAr: xhr.response,
        });
        console.log('pdfAr length:',this.state.pdfAr.length);
      }
    });
    xhr.send();
  }

  componentDidMount() {
    this.loadAllPDF();
  }

  /**
   * Render the component.
   */

  render() {
    const { match, location, history } = this.props;

    return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
        <div className="sidebar" style={{ width: "25vw",padding:'15px' }}>
          <p>Upload new PDF</p>
          <PdfUploadForm
            loadAllPDF ={this.loadAllPDF}
          />
        </div>);
        <div
          style={{
            height: "100vh",
            width: "75vw",
            overflowY: "scroll",
            position: "relative"
          }}
          className="pdfbar"
        >
        <p>PDF List</p>
        <ul className="pdf__item">
          {this.state.pdfAr.map((pdf, index) => (
            <li
              key={index}
              className="sidebar__highlight"
              onClick={() => {
                //this.openPdf(pdf._id,pdf.filename);
                history.push("/pdf?url="+pdf.filename+"&id="+pdf._id);
              }}
            >
              <div style={{'overflow': 'hidden'}}>
                <div style={{'float':'left','height':202,'margin-right':'10px','display':'inline-block'}}>
                  <img src={pdf._id+".svg"} width="120" height="200" class="svg"/>
                </div>
                <strong>{pdf.originalname}</strong><br/>
                {MyLocalize.translate('Description')}: {pdf.description}<br/>
                {MyLocalize.translate('Pages')+": "+ pdf.pdfInfo.pdfInfo.numPages} <br/>
                {MyLocalize.translate('Total annotations') +": "+ pdf.annotations.length}<br/>
                <a href="#" onClick={(e)=>{this.goPDFInfo(e,pdf._id,history)}}>{MyLocalize.translate('Document info')}</a><br/>
                <a href="#" onClick={(e)=>{this.downloadPDF(e,pdf.path,pdf.originalname)}}>{MyLocalize.translate('Download original')}</a> |
                <a href="#" onClick={(e)=>{this.downloadPDFAnnotated(e,pdf._id,pdf.path,pdf.originalname.split('.')[0]+'_annotated.pdf')}}>{MyLocalize.translate('Download annotated PDF')}</a><br/>
                {pdf.areYouTheAuthor?( <a href="#" onClick={(e)=>{this.deletePDF(e,pdf._id,pdf.path)}}>{MyLocalize.translate('Delete')}</a>):<span>Author: {pdf.author}</span>}<br/>

              </div>
            </li>
          ))}
        </ul>

        </div>
    </div>);
  }
}
export default DashboardPage;
