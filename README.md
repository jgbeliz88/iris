# github_ci_template

Plantilla para unir aplicación y ci en el mismo repositorio.
Los ficheros contienen lo básico. Hay que completar según proyectos:

- `CODEOWNERS`: Contenido que requiere aprobación de una persona o equipo concreto cada vez que se modifica.
- `.dockerignore`: Ficheros y directorios que los comandos `ADD` y `COPY` de un *Dockerfile* deben ignorar.
- `.gitattributes`: Atributos de ficheros y directorios a nivel de `git`. Se utiliza como el `.dockerignore`, pero para `git`.
- `.gitignore`: Ficheros y directorios que deben ser ignorados por el control de versiones y no deben subir a los repositorios.

## Estructura de ficheros DEV

### Ejecutar en local

Requiere VPN y sesión iniciada en ECR para descargar la imagen base:

```sh
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 088427993007.dkr.ecr.eu-west-1.amazonaws.com
docker compose up
```

- La API queda en `http://localhost:3000` y el depurador en el puerto `9229`.
- Los cambios en `src/` reinician la aplicación automáticamente, sin reconstruir la imagen.
- Al cambiar dependencias, ejecutar `docker compose up --build`.

### Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| `GET` | `/status/status-simple` | `{"code":"OK","statusCode":200}` |
| `GET` | `/status/status-complete` | `{"code":"OK","statusCode":200}` |
| `POST` | `/assets/startCopy` | Devuelve el JSON recibido |

### Estructura

```
src/
  index.ts      # Arranque y parada de la aplicación
  app.ts        # Construcción de la instancia de Fastify
  config/       # Variables de entorno
  plugins/      # Comportamiento global: logs de peticiones y gestión de errores
  modules/      # Una carpeta por dominio: routes -> controller -> service
  shared/       # Logger, errores y tipos comunes
```

Para añadir un dominio, crear `src/modules/<dominio>/` con estos ficheros y registrar las rutas en `src/app.ts`:

- `<dominio>.routes.ts`: asocia cada URL con su controller.
- `<dominio>.controller.ts`: lee la petición, llama al service y responde. Sin lógica de negocio.
- `<dominio>.service.ts`: lógica de negocio, sin dependencias de Fastify. Recibe datos y un `TraceLogger`, y lanza `AppError` en los errores previstos.

### Logs

Cada petición genera dos líneas JSON con el mismo `traceId`:

1. **Inicio**: se imprime al momento, con el método, la ruta, la query y el body. Una petición que se quede colgada deja así constancia. Una petición cuyo body no se puede parsear no genera esta línea.
2. **Traza**: se imprime al terminar, con el body, los pasos del service, la respuesta y el código de estado.

En los services, los pasos se registran con `log.step()`:

```ts
log.step('assets.startCopy', 'Respuesta recibida del servicio X', response);
```

`SAMPLE_LOG` debe quedar sin definir o a `100`; con un valor menor se descartan líneas de nivel `info`.

## Estructura de ficheros OPS

Además del contenido básico en los ficheros `CODEOWNERS`, `.dockerignore`, `.gitattributes` y `.gitignore`, el contenido *OPS* está almacenado en el subdirectorio `ci/` de la siguiente forma:

- `ci/config`: Configuración que forma parte del despliegue. Es configuración de la aplicación que será editada por ambas partes. Por parte de *OPS* se insertarán en las configuraciones los marcadores necesarios para sustituir por datos reales en el momento el despliegue. Por la parte de *DEV* se gestionarán las configuraciones en sí, respetando los marcadores a sustituir en despliegue.
- `ci/terraform`: Código de terraform para el despliegue de la infraestructura específica del proyecto.


git ls-remote git@github.com:grupomediaset/euw1-mes-dm-$(jq -r '.project_name' ../../project.json).git

Modificar project.json
cd /Users/deploy/app/mds-sm-app-template/ci/terraform/infra
terraform init -backend-config="key=$(jq -r '.app' ../../project.json)/$(jq -r '.project_name' ../../project.json)/$(pwd |awk -F/ '{print $(NF)}')/terraform.tfstate"
# terraform apply -var-file=../../project.json
terraform plan -out=plan.tfplan -input=false
terraform apply -input=false plan.tfplan
git clone git@github.com:grupomediaset/euw1-mes-dm-$(jq -r '.project_name' ../../project.json).git /Users/deploy/app/euw1-mes-dm-$(jq -r '.project_name' ../../project.json)
cp ../../project.json /Users/deploy/app/euw1-mes-dm-$(jq -r '.project_name' ../../project.json)/ci/project.json
rm -Rf .terraform
git checkout ../../project.json
cd /Users/deploy/app/euw1-mes-dm-$(jq -r '.project_name' ../../project.json)/ci/terraform/infra/
terraform init -backend-config="key=$(jq -r '.app' ../../project.json)/$(jq -r '.project_name' ../../project.json)/$(pwd |awk -F/ '{print $(NF)}')/terraform.tfstate"
terraform plan -var-file=../../project.json
git add ../../project.json
git commit -m "First commit. Terraform Infra"
git push
