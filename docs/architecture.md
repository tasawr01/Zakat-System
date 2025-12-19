# System Architecture Diagram

```mermaid
graph TD
    User[User (Donor/Beneficiary/Admin)] -->|HTTPS| NextJS[Next.js App (Frontend + API)]
    
    subgraph "Application Layer"
        NextJS -->|Auth| AuthModule[Auth Module]
        NextJS -->|API Calls| API[API Routes]
    end
    
    subgraph "Database Layer (Oracle)"
        API -->|SQL/PLSQL| OracleDB[(Oracle Database 19c/21c)]
        
        OracleDB -->|Partitioning| Partitions[Partitions (Year/Region)]
        OracleDB -->|Fragmentation| Fragments[Fragments (Vertical/Horizontal)]
        OracleDB -->|MV| MV[Materialized Views]
        OracleDB -->|DB Link| RemoteDB[(Remote NGO DB)]
    end
    
    subgraph "Storage & ETL"
        OracleDB -->|BLOB| FileStorage[Document Storage]
        CSV[CSV Files] -->|External Table| OracleDB
    end
```
