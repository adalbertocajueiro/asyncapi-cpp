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

  independentNodes:any[] = []
  dependentNodes:any[] = []

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
          this.cppText = this.convertNodes()
          
        }
      )
    
    
  }

  buildNodes(){
    if (this.schemasHandler){
      this.schemasHandler.independentSchemas.forEach(sch => {
        var astBuilder = new CppBuilderVisitor()
        var node = astBuilder.buildObject(sch)
        if (node) {
          this.independentNodes.push(node)
          //console.log(cppGenerator.visitNode(node))
        }

      })

      this.schemasHandler.dependentSchemas.forEach(sch => {
        var astBuilder = new CppBuilderVisitor()
        var cppGenerator = new CppCodeVisitor()
        var node = astBuilder.buildObject(sch)
        if (node) {
          this.dependentNodes.push(node)
          //console.log(cppGenerator.visitNode(node))
        }

      })
    }
    
  }

  convertNodes(){
    var result = ''

    result = result.concat('#include <string>\n')
    result = result.concat('#include "nlohmann/json.hpp"\n\n')

    var cppGenerator = new CppCodeVisitor()
    this.independentNodes.forEach( node => {
      result = result.concat(cppGenerator.visitNode(node))
      result = result.concat('\n\n')
    })

    this.dependentNodes.forEach(node => {
      result = result.concat(cppGenerator.visitNode(node))
      result = result.concat('\n\n')
    })

    return result
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

  exportToCpp(){
    const data = this.cppText
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "definitions.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl);
  }
}
