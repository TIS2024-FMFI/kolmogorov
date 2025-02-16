# kolmogorov
Application for visualization of dependencies of math axioms and theorems.

## Description
Kolmogorov is a web application designed to help mathematicians visualize and understand the relationships between mathematical statements, axioms, and theorems. The application provides a graphical representation of mathematical dependencies using an interactive graph interface.

### Key Features
- Upload and parse Metamath (.mm) database files
- Interactive graph visualization of mathematical dependencies
- Two main visualization modes:
  - Statements supporting theory statements (upward dependencies)
  - Statements supported by theory statements (downward dependencies)
- Search functionality for mathematical statements
- Export capabilities (JSON, JPG, and text formats)
- Customizable graph depth and display options

## Installation

### Prerequisites
- Python 3.7+
- pip (Python package manager)
- FuzzyWuzzy and Flask python libs

### Setup
1. Clone the repository:
bash
git clone https://github.com/yourusername/kolmogorov.git
cd kolmogorov
2. Run the server from bash by:
python src/run.py 
3. Open your web browser and navigate to:
http://127.0.0.1:5000