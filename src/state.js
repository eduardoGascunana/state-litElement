export default function state(SuperClass) {
  return class StateClass extends SuperClass {

    /**
     * Comprueba si una propiedad es pública o privada comprobando las propiedades declaradas en el getter estatico "properties"
     * 
     * @param {Object} context          Instancia del componente
     * @param {String} name             Nombre de la propiedad
     * @returns {Boolean}
     */
    static isPublicProp(context, name) {
      return context.constructor.properties.hasOwnProperty(name);
    }

    /**
     * Crea una propiedad privada para usarse:
     *    - internamente en el getter y setter de cada propiedad publica
     *    - de forma independiente
     * 
     * @param {Object} context          Instancia del componente
     * @param {String} nameProp         Nombre de la propiedad
     * @param {Object} value            Valor a asingar
     */
    static createPrivateProp(context, nameProp, value) {
      Object.defineProperty(context, nameProp, {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    /**
     * Crea el getter y setter de una propiedad pública y los añade al componente
     * 
     * @param {Object} context          Instancia del componente
     * @param {String} nameProp         Nombre de la propiedad pública 
     */
    static createAccessorPublicProp(context, nameProp) {
      const privateNameProp = `_${nameProp}`;
      Object.defineProperty(context, nameProp, {
        enumerable: true,
        configurable: true,
        get() {
          return context[privateNameProp];
        },
        set(value) {
          const oldValue = context[privateNameProp];
          context[privateNameProp] = value;
          context.requestUpdate(`${nameProp}`, oldValue);
        },
      });
    }

    /**
     * Se sobreescriben los metodos get y/o set de una propiedad publica si desea modificarse su comportamiento por defecto
     * 
     * @param {Object} context          Instancia del componente
     * @param {String} nameProp         Nombre de la propiedad
     * @param {Object} value            Funciones que desean modificarse
     */
    static overwriteAccessorPublicProp(context, nameProp, funcs) {
      Object.keys(funcs).forEach(accessor => {
        Object.defineProperty(context, nameProp, {
          [accessor]: funcs[accessor]
        });
      });
    }

    /**
     * Asigna un valor a una propiedad pública (que peternece al estado del componente)
     * Internamente ejecutará el setter (creado automaticamente o sobreescrito) de dicha propiedad, asignándole el valor a su propiedad privada
     * 
     * @param {Object} context          Instancia del componente
     * @param {String} nameProp         Nombre de la propiedad
     * @param {Object} value            Valor a asignar
     */
    static setPublicProp(context, nameProp, value) {
      context[nameProp] = value;
    }

    /**
     * Asigna un valor a una propiedad privada (que peternece al estado del componente), solicitando una actualización del componente
     * 
     * @param {Object} context          Instancia del componente
     * @param {String} nameProp         Nombre de la propiedad
     * @param {Object} value            Valor a asingar
     */
    static setPrivateProp(context, nameProp, value) {
      const oldValue = context[nameProp];
      context[nameProp] = value;
      context.requestUpdate(`${nameProp}`, oldValue);
    }

    constructor() {
      super();
      const { isPublicProp, setPublicProp, setPrivateProp } = StateClass;
      this.state = new Proxy(this, {
        get(obj, prop) {
          if (obj.hasOwnProperty(prop)) {
            return obj[prop];
          }
        },
        set(obj, prop, value) {
          if (obj.hasOwnProperty(prop)) {
            if (isPublicProp(obj, prop)) {
              setPublicProp(obj, prop, value);
            } else {
              setPrivateProp(obj, prop, value);
            }
            return true;
          }
        }
      });
    }

    /**
     * Crea el estado de un componente a partir de:
     *    - las propiedades publicas del componente
     *    - las propiedades privadas (recibidas por parametro)
     * Permite también modificar los metodos getter y/o setter de cada propiedad publica
     * 
     * Por cada propiedad publica se crean su getter y setter y una propiedad privada para usarse internamente
     * De esta forma se puede trabajar con los valores recibidos en las propiedades publicas sin tener que modificarlas pero ejecutandose su ciclo de vida (y renderizado) en cada cambio, al igual que con las propiedades privadas.
     * Se sigue el patron definido en https://lit-element.polymer-project.org/guide/properties#accessors-custom
     * 
     * @param {Object} props      Declaracion de propiedades privadas y/o modificacion de los getter y setter de una
     *                            propiedad publica
     */
    setState(props) {
      const { createPrivateProp, createAccessorPublicProp, isPublicProp, overwriteAccessorPublicProp } = StateClass;
      const publicProps = Object.keys(this.constructor.properties);
      const nameProps = Object.keys(props);

      publicProps.forEach(prop => {
        createPrivateProp(this, `_${prop}`, this[prop]);
        createAccessorPublicProp(this, prop);
      });

      nameProps.forEach(name => {
        if (isPublicProp(this, name)) {
          overwriteAccessorPublicProp(this, name, props[name]);
        } else {
          createPrivateProp(this, name, props[name]);
        }
      });
    }
  };
}
