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



