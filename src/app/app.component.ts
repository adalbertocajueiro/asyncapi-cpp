import { Component, ElementRef, ViewChild } from '@angular/core';
import { Parser } from '@asyncapi/parser';
import { AsyncAPIDocument } from '@asyncapi/parser/esm/models/v2/asyncapi';
import { SchemasHandler } from './util/schemas-handler';
import { LoadTextFileService } from './services/load-file.service';
import { ChannelsHandler } from './util/channels-handler';
import { Subject } from 'rxjs';
import { CodeListItemComponent } from './components/code-list-item/code-list-item.component';
import JSZip from 'jszip';

const parser = new Parser();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'AsyncAPI Generator Tool';

  yamlContent: any

  apiDocument?: AsyncAPIDocument
  documentContent: any
  parsedDocument?: any
  
  schemasHandler?: SchemasHandler
  channelsHandler?: ChannelsHandler

  definitionsContent: any
  conversionFunctionsContent: any
  metainfoContent: any
  topicsContent: any
  communicationLayerContent: any
  communicationLayerImplContent: any
  simulatedServerContent: any

  addItemSubject: Subject<any> = new Subject<any>()
  clearSubject: Subject<void> = new Subject<void>()

  selected: Set<string> = new Set<string>()
  maxSelecteds = ['definitions', 'conversion-functions', 'metainfo', 'topics', 'communication-layer', 'communication-layer-impl', 'simulated-server', 'all']

  constructor(private loadFileService: LoadTextFileService) {
    this.loadConversionFunctions()
    this.loadMetainfo()
    this.loadSimulatedServer()
  }

  loadConversionFunctions() {
    this.loadFileService.loadFileAsText('../assets/conversion-functions.tpl').subscribe(
      async data => {
        this.conversionFunctionsContent = data.toLocaleString()
      }
    )
  }

  loadMetainfo() {
    this.loadFileService.loadFileAsText('../assets/metainfo.tpl').subscribe(
      async data => {
        this.metainfoContent = data.toLocaleString()
      }
    )
  }

  loadSimulatedServer() {
    this.loadFileService.loadFileAsText('../assets/simulated-server.tpl').subscribe(
      async data => {
        this.simulatedServerContent = data.toLocaleString()
      }
    )
  }


  languageSelected(event:any){
    console.log('language', event)
  }
  
  onFileChanged(event: any) {
    var selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    if (selectedFile) {

      fileReader.readAsText(selectedFile, "UTF-8");

      fileReader.onload = async () => {
        //console.log('file result', this.selectedFile, fileReader.result)
        if (fileReader.result) {
          this.yamlContent = fileReader.result.toString()
          await this.parseYamlContent()

          this.documentContent = JSON.parse(JSON.stringify(this.parsedDocument.document._json))//parsed.document._json
        }

      }
      fileReader.onerror = (error) => {
        console.log(error);
      }
    }
  }

  async parseYamlContent() {
    this.parsedDocument = await parser.parse(this.yamlContent)
    console.log('parsed content', this.parsedDocument)

    this.apiDocument = this.parsedDocument.document
    this.schemasHandler = new SchemasHandler(this.apiDocument!.components().schemas())
    this.channelsHandler = new ChannelsHandler(this.apiDocument!.allChannels())

    this.topicsContent = this.channelsHandler?.generateTopics()
    this.communicationLayerContent = this.channelsHandler?.generateCommunicationLayer()!
    this.communicationLayerImplContent = this.channelsHandler?.generateCommunicationLayerImpl()!
    this.documentContent = JSON.parse(JSON.stringify(this.parsedDocument.document._json))
    this.definitionsContent = this.schemasHandler.generateDefinitions()
  }

  definitionsClicked() {
    var item = new CodeListItemComponent()
    item.content = this.definitionsContent
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
    item.content = this.metainfoContent
    item.label = 'metainfo'
    this.addItemSubject.next(item)
  }

  topicsClicked() {
    var item = new CodeListItemComponent()
    item.content = this.topicsContent
    item.label = 'topics'
    this.addItemSubject.next(item)
  }

  communicationLayerClicked() {
    var item = new CodeListItemComponent()
    item.content = this.communicationLayerContent
    item.label = 'communication-layer'
    this.addItemSubject.next(item)
  }

  communicationLayerImplClicked() {
    var item = new CodeListItemComponent()
    item.content = this.communicationLayerImplContent
    item.label = 'communication-layer-impl'
    this.addItemSubject.next(item)
  }

  simulatedServerClicked() {
    var item = new CodeListItemComponent()
    item.content = this.simulatedServerContent
    item.label = 'simulated-server'
    this.addItemSubject.next(item)
  }

  allItemsClicked(event: any) {
    console.log('button group', event)
  }

  groupChanged(event: any) {
    console.log('event', event)
    if (event.source?.value == 'all') {
      if (event.source?._checked) {
        this.selected.clear()
        this.clearSubject.next()
        this.maxSelecteds.forEach(s => this.selected.add(s))
        this.definitionsClicked()
        this.conversionFunctionsClicked()
        this.metainfoClicked()
        this.topicsClicked()
        this.communicationLayerClicked()
        this.communicationLayerImplClicked()
        this.simulatedServerClicked()
      } else {
        this.selected.clear()
        this.clearSubject.next()
      }
    } else {
      if (this.selected.has(event.source?.value)) {
        this.selected.delete(event.source?.value)
        this.selected.delete('all')
      } else {
        this.selected.add(event.source?.value)
        if (this.selected.size == this.maxSelecteds.length - 1) {
          this.selected.add('all')
        }
      }
    }
  }

  exportDefinitions() {
    const data = this.definitionsContent
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
    const data = this.metainfoContent
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
    const data = this.topicsContent
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
    const data = this.communicationLayerContent
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
    const data = this.communicationLayerImplContent
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

  exportSimulatedServer() {
    const data = this.simulatedServerContent
    const blob = new Blob([data], {
      type: 'application/octet-stream'
    });
    const a = document.createElement('a')
    var fileUrl = window.URL.createObjectURL(blob);
    a.href = fileUrl
    a.download = "simulated-server.cpp"
    a.click();
    URL.revokeObjectURL(fileUrl);
  }

  export(event: CodeListItemComponent) {
    console.log('event label')
    switch (event.label) {
      case 'definitions':
        this.exportDefinitions()
        break
      case 'conversion-functions':
        this.exportConversionFunctions()
        break
      case 'metainfo':
        this.exportInitialMetaInfo()
        break
      case 'topics':
        this.exportTopics()
        break
      case 'communication-layer':
        this.exportCommunicationLayer()
        break
      case 'communication-layer-impl':
        this.exportCommunicationLayerImpl()
        break
      case 'simulated-server':
        this.exportSimulatedServer()
        break
      case 'all':
        this.exportToZip()
        break
    }
  }

  exportToZip() {
    var zip = new JSZip();
    zip.file("definitions.cpp", this.definitionsContent);
    zip.file("conversion-functions.cpp", this.conversionFunctionsContent);
    zip.file("metainfo.cpp", this.metainfoContent);
    zip.file("topics.cpp", this.topicsContent);
    zip.file("communication-layer.cpp", this.communicationLayerContent);
    zip.file("communication-layer-impl.cpp", this.communicationLayerImplContent);
    zip.file("simulated-server.cpp", this.simulatedServerContent);
    zip.generateAsync({ type: 'blob' }).then(content => {
      if (content) {
        const blob = new Blob([content], {
          type: 'application/octet-stream'
        });
        const a = document.createElement('a')
        var fileUrl = window.URL.createObjectURL(blob);
        a.href = fileUrl
        a.download = "generated.zip"
        a.click();
        URL.revokeObjectURL(fileUrl);
      }
    })
  }
}
