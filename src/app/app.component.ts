import { Component } from '@angular/core';
import { Parser } from '@asyncapi/parser';
import { AsyncAPIDocument } from '@asyncapi/parser/esm/models/v2/asyncapi';
import { SchemasHandler } from './util/schemas-handler';
import { LoadYamlService } from './services/load-yaml.service';
import { CppBuilderVisitor } from './visitors/CppBuilderVisitor';
import { CppCodeVisitor} from './visitors/CppCodeVisitor';

const parser = new Parser();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'asyncapi-cpp';

  selectedFile: any
  documentContent:any

  yamlContent:any
  schemasHandler?:SchemasHandler

  cppText = ''

  constructor(private loadYamlService: LoadYamlService) {
    this.loadYamlService.loadYaml('../assets/edscorbot-async-api.yaml').subscribe(
        async data => {
        this.yamlContent = data.toLocaleString()
          //console.log('content', this.yamlContent)
          var parsed: any = await parser.parse(this.yamlContent)
          console.log('parsed content', parsed)
          var apiDocument: AsyncAPIDocument = parsed.document
          this.schemasHandler = new SchemasHandler(apiDocument.components().schemas())
          this.documentContent = JSON.parse(JSON.stringify(parsed.document._json))
          this.buildNodes()
        }
      )
    this.cppText = 'enum Signal { GET, SET }'
    
  }

  buildNodes(){
    if (this.schemasHandler){
      this.schemasHandler.independentSchemas.forEach(sch => {
        var astBuilder = new CppBuilderVisitor()
        var cppGenerator = new CppCodeVisitor()
        var node = astBuilder.buildObject(sch)
        if (node) {
          //console.log(visitNode(node))
          console.log(cppGenerator.visitNode(node))
        }

      })

      this.schemasHandler.dependentSchemas.forEach(sch => {
        var astBuilder = new CppBuilderVisitor()
        var cppGenerator = new CppCodeVisitor()
        var node = astBuilder.buildObject(sch)
        if (node) {
          //console.log(visitNode(node))
          console.log(cppGenerator.visitNode(node))
        }

      })
    }
    
  }

  onFileChanged(event: any) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    if (this.selectedFile) {

      fileReader.readAsText(this.selectedFile, "UTF-8");

      fileReader.onload = async () => {
        //console.log('file result', this.selectedFile, fileReader.result)
        if (fileReader.result) {
          var parsed: any = await parser.parse(fileReader.result.toString())
          console.log('parsed content', parsed)
          var apiDocument: AsyncAPIDocument = parsed.document
          
          this.documentContent = JSON.parse(JSON.stringify(parsed.document._json))//parsed.document._json
          //JSON.parse(JSON.stringify(
        }

      }
      fileReader.onerror = (error) => {
        console.log(error);
      }
    }
  }
}
