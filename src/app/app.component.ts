import { Component } from '@angular/core';
import { Parser } from '@asyncapi/parser';
import { AsyncAPIDocument } from '@asyncapi/parser/esm/models/v2/asyncapi';
import { SchemasHandler } from './util/schemas-handler';
import { LoadTextFileService } from './services/load-file.service';
import { CppSchemaBuilderVisitor } from './visitors/CppSchemaBuilderVisitor';
import { CppSchemaGeneratorVisitor } from './visitors/CppSchemaGeneratorVisitor';
import { ChannelsHandler } from './util/channels-handler';
import { InitialMetainfoHandler } from './util/initial-metainfo-handler';
import { Subject } from 'rxjs';
import { CodeListItemComponent } from './components/code-list-item/code-list-item.component';

const parser = new Parser();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'asyncapi-cpp';

  apiDocument?: AsyncAPIDocument
  documentContent: any

  yamlContent: any
  schemasHandler?: SchemasHandler
  channelsHandler?: ChannelsHandler
  metainfoHandler?: InitialMetainfoHandler

  conversionFunctionsContent: any
  initialMetainfoContent: any

  independentNodes: any[] = []
  dependentNodes: any[] = []

  addItemSubject:Subject<any> = new Subject<any>()

  cppText = ''

  constructor(private loadFileService: LoadTextFileService) {
    this.loadConversionFunctions()
    this.loadInitialMetainfo()
    this.loadFileService.loadFileAsText('../assets/edscorbot-async-api.yaml').subscribe(
      async data => {
        this.yamlContent = data.toLocaleString()
        //console.log('content', this.yamlContent)
        var parsed: any = await parser.parse(this.yamlContent)
        console.log('parsed content', parsed)
        this.apiDocument = parsed.document
        this.schemasHandler = new SchemasHandler(this.apiDocument!.components().schemas())
        this.channelsHandler = new ChannelsHandler(this.apiDocument!.allChannels())
        this.metainfoHandler = new InitialMetainfoHandler(this.initialMetainfoContent)
        this.documentContent = JSON.parse(JSON.stringify(parsed.document._json))
        this.buildNodes()
        this.cppText = this.convertNodes()

      }
    )

    

  }

  loadConversionFunctions() {
    this.loadFileService.loadFileAsText('../assets/conversion-functions.tpl').subscribe(
      async data => {
        this.conversionFunctionsContent = data.toLocaleString()
      }
    )
  }

  loadInitialMetainfo() {
    this.loadFileService.loadFileAsText('../assets/metainfo.tpl').subscribe(
      async data => {
        this.initialMetainfoContent = data.toLocaleString()
      }
    )
  }

  buildNodes() {
    if (this.schemasHandler) {
      this.schemasHandler.independentSchemas.forEach(sch => {
        var astBuilder = new CppSchemaBuilderVisitor()
        var node = astBuilder.buildObject(sch)
        if (node) {
          this.independentNodes.push(node)
          //console.log(cppGenerator.visitNode(node))
        }

      })

      this.schemasHandler.dependentSchemas.forEach(sch => {
        var astBuilder = new CppSchemaBuilderVisitor()
        var cppGenerator = new CppSchemaGeneratorVisitor()
        var node = astBuilder.buildObject(sch)
        if (node) {
          this.dependentNodes.push(node)
          //console.log(cppGenerator.visitNode(node))
        }

      })
    }

  }

  convertNodes() {
    var result = ''

    result = result.concat('#include <string>\n')
    result = result.concat('#include "nlohmann/json.hpp"\n\n')

    result = result.concat('using json = nlohmann::json;\n\n')

    var cppGenerator = new CppSchemaGeneratorVisitor()
    this.independentNodes.forEach(node => {
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
    var selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    if (selectedFile) {

      fileReader.readAsText(selectedFile, "UTF-8");

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

  definitionsClicked(){
    var item = new CodeListItemComponent()
    item.content = this.cppText
    item.label = 'definitions'
    this.addItemSubject.next(item)
  }

  conversionFunctionsClicked() {
    var item = new CodeListItemComponent()
    item.content = this.conversionFunctionsContent
    item.label = 'conversion-functions'
    this.addItemSubject.next(item)
  }

  metainfoClicked() {
    var item = new CodeListItemComponent()
    item.content = this.initialMetainfoContent
    item.label = 'metainfo'
    this.addItemSubject.next(item)
  }

  topicsClicked() {
    var item = new CodeListItemComponent()
    item.content = this.channelsHandler?.buildTopics()!
    item.label = 'topics'
    this.addItemSubject.next(item)
  }

  communicationLayerClicked() {
    var item = new CodeListItemComponent()
    this.channelsHandler?.buildTopics() // para criar os nomes dos topicos
    item.content =this.channelsHandler?.buildCommunicationLayer()!
    item.label = 'communication-layer'
    this.addItemSubject.next(item)
  }

  communicationLayerImplClicked() {
    var item = new CodeListItemComponent()
    this.channelsHandler?.buildTopics() // para criar os nomes dos topicos
    item.content = this.channelsHandler?.buildCommunicationLayerImpl()!
    item.label = 'communication-layer-impl'
    this.addItemSubject.next(item)
  }

  exportToCpp() {
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

  exportConversionFunctions() {
    const data = this.conversionFunctionsContent
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "conversion-functions.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl);
  }

  exportInitialMetaInfo() {
    const data = this.initialMetainfoContent
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "metainfo.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl);
  }

  exportTopics() {
    const data = this.channelsHandler?.buildTopics()!
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "topics.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl);
  }

  exportCommunicationLayer() {
    this.channelsHandler?.buildTopics() // para criar os nomes dos topicos
    const data = this.channelsHandler?.buildCommunicationLayer()!
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "communication-layer.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl); 
    
  }

  exportCommunicationLayerImpl() {
    this.channelsHandler?.buildTopics() // para criar os nomes dos topicos
    const data = this.channelsHandler?.buildCommunicationLayerImpl()!
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "communication-layer-impl.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl);

  }
}
