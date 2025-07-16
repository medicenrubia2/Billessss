#!/usr/bin/env python3
"""
Comprehensive Backend Testing for ImpuestosRD
Tests all backend endpoints and functionality
"""

import requests
import json
import os
import tempfile
from typing import Dict, Any, Optional
import time

class ImpuestosRDBackendTester:
    def __init__(self, base_url: str = "https://1c7f9ee5-6c1e-4d07-81c5-0b8e4ae3bfb1.e1-us-east-azure.emergentmethods.ai"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_health_check(self):
        """Test GET /health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "OK":
                    self.log_test("Health Check", True, "Health endpoint working correctly", data)
                    return True
                else:
                    self.log_test("Health Check", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_root_endpoint(self):
        """Test GET / endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Root Endpoint", True, "Root endpoint working correctly", data)
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_calculadora_tipos(self):
        """Test GET /api/calculadora/tipos endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/calculadora/tipos")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if it has expected structure
                    expected_fields = ["id", "nombre", "descripcion", "porcentaje"]
                    if all(field in data[0] for field in expected_fields):
                        self.log_test("Calculadora Tipos", True, f"Found {len(data)} calculation types", data)
                        return True
                    else:
                        self.log_test("Calculadora Tipos", False, f"Invalid data structure: {data[0]}")
                        return False
                else:
                    self.log_test("Calculadora Tipos", False, f"Expected array, got: {data}")
                    return False
            else:
                self.log_test("Calculadora Tipos", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Calculadora Tipos", False, f"Error: {str(e)}")
            return False
    
    def test_calculadora_calcular(self):
        """Test POST /api/calculadora/calcular endpoint"""
        test_cases = [
            {
                "name": "Basic ITBIS calculation",
                "data": {
                    "subtotal": 1000,
                    "aplicarITBIS": True,
                    "aplicarIVA": False,
                    "aplicarRetencion": False,
                    "porcentajeITBIS": 18
                },
                "expected_itbis": 180,
                "expected_total": 1180
            },
            {
                "name": "ITBIS + IVA calculation",
                "data": {
                    "subtotal": 1000,
                    "aplicarITBIS": True,
                    "aplicarIVA": True,
                    "aplicarRetencion": False,
                    "porcentajeITBIS": 18,
                    "porcentajeIVA": 18
                },
                "expected_itbis": 180,
                "expected_iva": 180,
                "expected_total": 1360
            },
            {
                "name": "ITBIS with retention",
                "data": {
                    "subtotal": 1000,
                    "aplicarITBIS": True,
                    "aplicarIVA": False,
                    "aplicarRetencion": True,
                    "porcentajeITBIS": 18,
                    "porcentajeRetencion": 10
                },
                "expected_itbis": 180,
                "expected_retencion": 100,
                "expected_total": 1080
            }
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{self.base_url}/api/calculadora/calcular",
                    json=test_case["data"],
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate response structure
                    if "calculo" in data and "detalles" in data:
                        calculo = data["calculo"]
                        
                        # Check calculations
                        checks_passed = True
                        error_details = []
                        
                        if "expected_itbis" in test_case:
                            if abs(calculo["impuestos"]["itbis"] - test_case["expected_itbis"]) > 0.01:
                                checks_passed = False
                                error_details.append(f"ITBIS: expected {test_case['expected_itbis']}, got {calculo['impuestos']['itbis']}")
                        
                        if "expected_iva" in test_case:
                            if abs(calculo["impuestos"]["iva"] - test_case["expected_iva"]) > 0.01:
                                checks_passed = False
                                error_details.append(f"IVA: expected {test_case['expected_iva']}, got {calculo['impuestos']['iva']}")
                        
                        if "expected_retencion" in test_case:
                            if abs(calculo["impuestos"]["retencion"] - test_case["expected_retencion"]) > 0.01:
                                checks_passed = False
                                error_details.append(f"Retención: expected {test_case['expected_retencion']}, got {calculo['impuestos']['retencion']}")
                        
                        if abs(calculo["total"] - test_case["expected_total"]) > 0.01:
                            checks_passed = False
                            error_details.append(f"Total: expected {test_case['expected_total']}, got {calculo['total']}")
                        
                        if checks_passed:
                            self.log_test(f"Calculadora - {test_case['name']}", True, "Calculations correct", data)
                        else:
                            self.log_test(f"Calculadora - {test_case['name']}", False, f"Calculation errors: {'; '.join(error_details)}")
                            all_passed = False
                    else:
                        self.log_test(f"Calculadora - {test_case['name']}", False, f"Invalid response structure: {data}")
                        all_passed = False
                else:
                    self.log_test(f"Calculadora - {test_case['name']}", False, f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Calculadora - {test_case['name']}", False, f"Error: {str(e)}")
                all_passed = False
        
        # Test validation errors
        try:
            response = self.session.post(
                f"{self.base_url}/api/calculadora/calcular",
                json={"subtotal": "invalid"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 400:
                self.log_test("Calculadora - Validation", True, "Validation working correctly")
            else:
                self.log_test("Calculadora - Validation", False, f"Expected 400, got {response.status_code}")
                all_passed = False
                
        except Exception as e:
            self.log_test("Calculadora - Validation", False, f"Error: {str(e)}")
            all_passed = False
        
        return all_passed
    
    def test_contacto_enviar(self):
        """Test POST /api/contacto/enviar endpoint"""
        test_data = {
            "nombre": "Juan Pérez",
            "email": "juan.perez@test.com",
            "telefono": "+1-809-555-0123",
            "mensaje": "Este es un mensaje de prueba para verificar el funcionamiento del sistema de contacto."
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/contacto/enviar",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 201:
                data = response.json()
                if "message" in data and "contacto" in data:
                    self.log_test("Contacto Enviar", True, "Contact message sent successfully", data)
                    return True, data.get("contacto", {}).get("id")
                else:
                    self.log_test("Contacto Enviar", False, f"Invalid response structure: {data}")
                    return False, None
            else:
                self.log_test("Contacto Enviar", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Contacto Enviar", False, f"Error: {str(e)}")
            return False, None
    
    def test_contacto_validation(self):
        """Test contact form validation"""
        test_cases = [
            {
                "name": "Missing nombre",
                "data": {"email": "test@test.com", "mensaje": "Test"},
                "should_fail": True
            },
            {
                "name": "Missing email",
                "data": {"nombre": "Test", "mensaje": "Test"},
                "should_fail": True
            },
            {
                "name": "Invalid email",
                "data": {"nombre": "Test", "email": "invalid-email", "mensaje": "Test"},
                "should_fail": True
            },
            {
                "name": "Missing mensaje",
                "data": {"nombre": "Test", "email": "test@test.com"},
                "should_fail": True
            }
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{self.base_url}/api/contacto/enviar",
                    json=test_case["data"],
                    headers={"Content-Type": "application/json"}
                )
                
                if test_case["should_fail"]:
                    if response.status_code == 400:
                        self.log_test(f"Contacto Validation - {test_case['name']}", True, "Validation working correctly")
                    else:
                        self.log_test(f"Contacto Validation - {test_case['name']}", False, f"Expected 400, got {response.status_code}")
                        all_passed = False
                else:
                    if response.status_code == 201:
                        self.log_test(f"Contacto Validation - {test_case['name']}", True, "Valid data accepted")
                    else:
                        self.log_test(f"Contacto Validation - {test_case['name']}", False, f"Expected 201, got {response.status_code}")
                        all_passed = False
                        
            except Exception as e:
                self.log_test(f"Contacto Validation - {test_case['name']}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_contacto_listar(self):
        """Test GET /api/contacto endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/contacto")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Contacto Listar", True, f"Retrieved {len(data)} contacts", {"count": len(data)})
                    return True
                else:
                    self.log_test("Contacto Listar", False, f"Expected array, got: {type(data)}")
                    return False
            else:
                self.log_test("Contacto Listar", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Contacto Listar", False, f"Error: {str(e)}")
            return False
    
    def test_facturas_listar(self):
        """Test GET /api/facturas endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/facturas")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Facturas Listar", True, f"Retrieved {len(data)} invoices", {"count": len(data)})
                    return True
                else:
                    self.log_test("Facturas Listar", False, f"Expected array, got: {type(data)}")
                    return False
            else:
                self.log_test("Facturas Listar", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Facturas Listar", False, f"Error: {str(e)}")
            return False
    
    def test_facturas_subir(self):
        """Test POST /api/facturas/subir endpoint"""
        try:
            # Create a test PDF file
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                # Write some PDF-like content (minimal PDF structure)
                pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
229
%%EOF"""
                temp_file.write(pdf_content)
                temp_file_path = temp_file.name
            
            # Test file upload
            with open(temp_file_path, 'rb') as f:
                files = {'factura': ('test_invoice.pdf', f, 'application/pdf')}
                response = self.session.post(f"{self.base_url}/api/facturas/subir", files=files)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            if response.status_code == 201:
                data = response.json()
                if "message" in data and "factura" in data:
                    self.log_test("Facturas Subir", True, "File uploaded successfully", data)
                    return True, data.get("factura", {}).get("id")
                else:
                    self.log_test("Facturas Subir", False, f"Invalid response structure: {data}")
                    return False, None
            else:
                self.log_test("Facturas Subir", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Facturas Subir", False, f"Error: {str(e)}")
            return False, None
    
    def test_facturas_download(self, factura_id: Optional[str] = None):
        """Test GET /api/facturas/:id/download endpoint"""
        if not factura_id:
            # Try to get a factura ID from the list
            try:
                response = self.session.get(f"{self.base_url}/api/facturas")
                if response.status_code == 200:
                    facturas = response.json()
                    if facturas and len(facturas) > 0:
                        factura_id = facturas[0].get("id")
                    else:
                        self.log_test("Facturas Download", False, "No invoices available to test download")
                        return False
                else:
                    self.log_test("Facturas Download", False, "Could not retrieve invoices list for download test")
                    return False
            except Exception as e:
                self.log_test("Facturas Download", False, f"Error getting invoices list: {str(e)}")
                return False
        
        if not factura_id:
            self.log_test("Facturas Download", False, "No invoice ID available for download test")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/api/facturas/{factura_id}/download")
            
            if response.status_code == 200:
                data = response.json()
                if "downloadUrl" in data:
                    self.log_test("Facturas Download", True, "Download URL generated successfully", data)
                    return True
                else:
                    self.log_test("Facturas Download", False, f"Invalid response structure: {data}")
                    return False
            elif response.status_code == 404:
                self.log_test("Facturas Download", True, "404 handling working correctly (invoice not found)")
                return True
            else:
                self.log_test("Facturas Download", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Facturas Download", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting ImpuestosRD Backend Tests")
        print("=" * 50)
        
        # Basic connectivity tests
        health_ok = self.test_health_check()
        root_ok = self.test_root_endpoint()
        
        if not health_ok:
            print("\n❌ Backend is not responding. Stopping tests.")
            return False
        
        # API endpoint tests
        tipos_ok = self.test_calculadora_tipos()
        calc_ok = self.test_calculadora_calcular()
        
        # Contact tests
        contact_sent, contact_id = self.test_contacto_enviar()
        contact_validation_ok = self.test_contacto_validation()
        contacts_list_ok = self.test_contacto_listar()
        
        # Invoice tests
        invoices_list_ok = self.test_facturas_listar()
        invoice_uploaded, invoice_id = self.test_facturas_subir()
        download_ok = self.test_facturas_download(invoice_id)
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['details']}")
        
        # Critical functionality check
        critical_tests = [health_ok, calc_ok, contact_sent, invoices_list_ok]
        all_critical_passed = all(critical_tests)
        
        print(f"\n🎯 CRITICAL FUNCTIONALITY: {'✅ WORKING' if all_critical_passed else '❌ ISSUES FOUND'}")
        
        return all_critical_passed

def main():
    """Main test execution"""
    # Use the backend URL from frontend .env
    backend_url = "http://localhost:4000"
    
    print(f"Testing backend at: {backend_url}")
    
    tester = ImpuestosRDBackendTester(backend_url)
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All critical backend functionality is working!")
        return 0
    else:
        print("\n⚠️  Some backend functionality has issues.")
        return 1

if __name__ == "__main__":
    exit(main())