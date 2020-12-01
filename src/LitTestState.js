import { LitElement, html } from 'lit-element';
import state from './state.js';

export class LitTestState extends state(LitElement) {
  static get is() {
    return 'lit-test-state';
  }

  // Solo se declaran las propiedades publicas
  static get properties() {
    return {
      ...super.properties,
      count: { type: Number },
      count2: { type: Number },
    };
  }

  constructor() {
    super();
    this._count4 = 3;
  }

  connectedCallback() {
    super.connectedCallback();

    // se añaden las propiedades privadas y/o las publicas con el metodo que se quiera sobreescribir(get y/o set)
    this.setState({
      _count3: 2,
      count: {
        set(value) {
          const oldValue = this._count;
          this._count = value + 10;
          this.requestUpdate('count', oldValue)
        }
      },
    });
  }

  render() {
    return html`
      <div>
        <button @click="${() => this.state.count +=1}">Sumar 1</button>
        Propiedad Publica "count": ${this.state.count}
      </div>
      <br>
      <div>
        <button @click="${() => this.state.count2 += 1}">Sumar 1</button>  
        Propiedad Publica "count2": ${this.state.count2}
      </div>
      <br>
      <div>
        <button @click="${() => this.state._count3 += 1}">Sumar 1</button> 
        Propiedad Privada "_count3": ${this.state._count3}
      </div>
      <br>
      <div>
        <button @click="${() => this._count4 += 1}">Sumar 1</button>   
        Propiedad Privada "_count4" (no se renderiza): ${this._count4}
      </div>
    `;
  }
}
