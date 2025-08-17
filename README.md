Estelaris

El proyecto consiste en desarrollar una aplicación para apoyar a los estudiantes de bachillerato en su orientación vocacional y la formación de un perfil basado en competencias. La aplicación combinará métodos tradicionales, estrategias de colaboración comunitaria y análisis con inteligencia artificial (IA) para ofrecer una solución integral. Su objetivo es ser accesible económicamente, ofreciendo dos modalidades: una gratuita y autogestionada para usuarios individuales, y una modalidad institucional con un costo para las escuelas, que permitirá a los docentes monitorear y calificar a los estudiantes.

La aplicación está diseñada para ser accesible a estudiantes de cualquier nivel socioeconómico, priorizando la facilidad de uso y la accesibilidad para personas con discapacidades visuales, motrices y cognitivas. Funciona en dispositivos de baja capacidad y almacena los datos localmente, excepto aquellos relacionados con el análisis de IA y las interacciones sociales entre usuarios. Su diseño es sencillo, con cuatro menús principales que permiten navegar fácilmente por la app.

El proyecto utiliza herramientas y modelos ya existentes para ofrecer un sistema conjunto e innovador. Incluye el Test Inventario de Intereses Vocacionales de Kuder, el Exani-II (diseñado por el CENEVAL) y un modelo de evaluación por competencias similar al del Tecnológico de Monterrey. Estos tests proporcionan métricas cuantificables sobre las preferencias y habilidades de los estudiantes, que se integran en su perfil. Además, el uso de métricas cualitativas permite a los estudiantes identificar qué habilidades necesitan fortalecer, lo que les ayuda en su preparación preprofesional.

La aplicación también incluye un modelo de seguimiento (tracking) que permite a los estudiantes establecer metas y hábitos relacionados con las competencias que deben desarrollar. El cumplimiento de estas metas se registra en un sistema de “rachas”, que podría expandirse en el futuro para incluir medallas como incentivo. Además, tiene un apartado de networking comunitario que permite a los estudiantes ver las competencias desarrolladas por sus amigos, motivándolos a continuar.

Desde un punto de vista técnico, los resultados de los tests vocacionales y académicos se vinculan con las carreras profesionales y las competencias. La IA juega un papel crucial en la clasificación, predicción, agrupación y asociación de datos. Utilizando la API de Gemini, la plataforma procesa los resultados de los tests, clasificando las carreras según las categorías definidas y recomendando opciones afines al usuario. Los usuarios pueden marcar las competencias como “no iniciada”, “en progreso” o “adquirida”, lo que les permite hacer un seguimiento más efectivo de su progreso. En una segunda fase, se planea incorporar un sistema de retroalimentación para ajustar los resultados y evitar sesgos en la IA.

En términos de cumplimiento de la privacidad, el proyecto sigue el Reglamento General de Protección de Datos (GDPR) y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, garantizando la seguridad y el uso ético de los datos personales de los usuarios.

El modelo de ingresos del proyecto se basa en dos partes: un modelo freemium, donde la modalidad individual es gratuita, y una suscripción anual para instituciones educativas con un costo variable dependiendo de sus inscripciones.

El diseño de la aplicación se enfoca en la simplicidad y la intuición, Uno de los patrones de éxito de las aplicaciones es que mientras más simple y más intuitiva, más es utilizada por los usuarios (y por lo mismo, mejor cumple su objetivo). La propuesta busca soluciones reales, no perfectas, para ayudar a los estudiantes a encontrar su camino vocacional de manera efectiva y accesible.





Guía de instalación y uso – Estelaris

Requisitos
Node.js 18 o 20 (recomendado 20)
Python 3.10 o superior con pip
Git


API key de Google AI (Gemini) desde https://aistudio.google.com

Clonar el repositorio
git clone https://github.com/AyrtonSoler/hackathon-2025.git

cd hackathon-2025 (En caso de no funcionar, colocar el ‘path’ completo para ‘hackathon-2025’)

Backend (Django)
cd backend (En caso de no funcionar, colocar el ‘path’ completo para ‘backend’)

Crear entorno virtual  (Bash)

macOS/Linux: python -m venv .venv && source .venv/bin/activate
Windows (PowerShell): 
python -m venv .venv  
y luego 
 .venv\Scripts\Activate.ps1

Instalar dependencias  (Bash):
pip install -r requirements.txt

Migrar y ejecutar  (Bash):
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

El backend queda en http://127.0.0.1:8000

Endpoint usado por el front: /api/profile/summary/

Deja esta terminal corriendo

Frontend (Next.js)
Abrir una nueva terminal
cd frontend/menus/hackathon (En caso de no funcionar, colocar el ‘path’ completo)

Instalar dependencias: npm i
Crear archivo .env.local en frontend/menus/hackathon con :
 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
 GOOGLE_API_KEY=TU_API_KEY_DE_GEMINI
 GEMINI_MODEL=gemini-1.5-flash

 (ajusta la URL si cambiaste host/puerto del backend)


Ejecutar en desarrollo: npm run dev

El frontend queda en http://localhost:3000


Verificación rápida
Abre http://localhost:3000 para ver el Dashboard
Abre http://localhost:3000/competencias para ver el mapa estelar
Abre http://localhost:3000/profile para ver el radar de 10 ejes

Probar endpoints de IA (opcional, desde una terminal)
Esquema (ejes del radar y base de competencias) (Bash)

 curl -s http://localhost:3000/api/ai/schema | jq .


Análisis de perfil de ejemplo (Bash)

 curl -s -X POST http://localhost:3000/api/ai/analyze-profile 
 -H ‘Content-Type: application/json’ 
 -d ‘{
 “knowledgeTests”:[{“id”:“js_basics”,“score”:72},{“id”:“react_fundamentals”,“score”:81}],
 “psychoTests”:[{“id”:“enneagram_focus”,“score”:62},{“id”:“bigfive_extroversion”,“score”:58}],
 “projects”:[{“title”:“Ecommerce React”,“description”:“frontend TS + API REST”}],
 “baseCompetencies”:{“Frontend-TS”:55,“UI/UX”:50},
 “baseRadar”:{“Científica”:55,“Persuasiva”:55,“Artística”:55,“Mecánica”:55,“Social”:55,“Musical”:55,“Investigativa”:55,“Comunicativa”:55,“Emprendedora”:55,“Organizativa”:55}
 }’ | jq .

Chat con IA  (Bash)
 curl -s -X POST http://localhost:3000/api/ai/chat 
 -H ‘Content-Type: application/json’ 
 -d ‘{“message”:“Hola, ¿quién eres?”}’

Qué muestra cada página
/ : Dashboard con resumen, radar compacto y lista de tests completados.
/competencias : Mapa estelar de competencias sugeridas y relaciones, más lista de carreras sugeridas.
/profile : Radar de 10 ejes (habilidades vocacionales) ajustado por IA.
/recursos : Gráfico de barras de resultados académicos y lista de tests.
/comunidad : Amigos y actividad.

Problemas comunes y soluciones

No se ve el radar o el mapa estelar
Asegúrate de que el backend responde /api/profile/summary/
Verifica /api/ai/schema y /api/ai/analyze-profile con los comandos curl arriba
Revisa la consola del navegador (Network) por errores 4xx/5xx

Errores 401 o 403 de Gemini
Revisa GOOGLE_API_KEY en .env.local y reinicia npm run dev

Error 429 de Gemini (cuota)
Cambia de API key o habilita billing. La app usa fallback local: si no hay cuota, debería renderizar con datos de respaldo


CORS o URLs incorrectas
Si cambiaste el host/puerto del backend, actualiza NEXT_PUBLIC_API_BASE_URL

Windows no activa el venv
Ejecuta PowerShell como administrador y corre: Set-ExecutionPolicy RemoteSigned (una sola vez). Después activa con .venv\Scripts\Activate.ps1


Comandos útiles
Backend:
python manage.py runserver
python manage.py migrate
python manage.py createsuperuser

Frontend:
npm run dev    (desarrollo)
npm run build  (build de producción)
npm run start  (servir build)



