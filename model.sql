-- ============================================
-- MODÈLE DE DONNÉES - AGRICONNECT
-- Plateforme de liaison Paysans-Collecteurs
-- ============================================

-- Table: users (Utilisateurs)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL, -- Hash bcrypt
    role ENUM('paysan', 'collecteur', 'admin') NOT NULL,
    photo_profil VARCHAR(255),
    adresse TEXT,
    localisation VARCHAR(100), -- Région/Ville
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    en_ligne BOOLEAN DEFAULT FALSE,
    derniere_connexion DATETIME,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email),
    INDEX idx_localisation (localisation)
);

-- Table: produits (Matières premières)
CREATE TABLE produits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paysan_id INT NOT NULL,
    nom VARCHAR(150) NOT NULL,
    type ENUM('grain', 'legumineuse', 'tubercule', 'fruit', 'legume', 'epice', 'autre') NOT NULL,
    sous_type VARCHAR(100), -- Ex: bio, sec, frais
    description TEXT,
    quantite_disponible DECIMAL(10, 2) NOT NULL,
    unite ENUM('kg', 'tonne', 'sac', 'litre') DEFAULT 'kg',
    prix_unitaire DECIMAL(10, 2) NOT NULL, -- En Ariary
    date_recolte DATE NOT NULL,
    date_peremption DATE,
    image_url VARCHAR(255),
    statut ENUM('disponible', 'rupture', 'archive') DEFAULT 'disponible',
    certification VARCHAR(100), -- Ex: Bio, AOP, etc.
    conditions_stockage TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paysan_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_paysan (paysan_id),
    INDEX idx_type (type),
    INDEX idx_statut (statut),
    INDEX idx_date_recolte (date_recolte)
);

-- Table: commandes (Transactions entre collecteurs et paysans)
CREATE TABLE commandes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    collecteur_id INT NOT NULL,
    paysan_id INT NOT NULL,
    quantite_commandee DECIMAL(10, 2) NOT NULL,
    prix_total DECIMAL(12, 2) NOT NULL,
    statut ENUM('en_attente', 'acceptee', 'refusee', 'en_livraison', 'livree', 'annulee') DEFAULT 'en_attente',
    message_collecteur TEXT, -- Message lors de la commande
    reponse_paysan TEXT, -- Réponse du paysan
    date_livraison_prevue DATE,
    date_livraison_effective DATE,
    adresse_livraison TEXT,
    mode_livraison ENUM('sur_place', 'livraison', 'a_convenir') DEFAULT 'a_convenir',
    frais_livraison DECIMAL(10, 2) DEFAULT 0,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    FOREIGN KEY (collecteur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (paysan_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_statut (statut),
    INDEX idx_collecteur (collecteur_id),
    INDEX idx_paysan (paysan_id),
    INDEX idx_date (date_commande)
);

-- Table: transactions (Paiements)
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL UNIQUE,
    payeur_id INT NOT NULL, -- Collecteur
    beneficiaire_id INT NOT NULL, -- Paysan
    montant DECIMAL(12, 2) NOT NULL,
    methode_paiement ENUM('mvola', 'orange_money', 'airtel_money', 'especes', 'virement', 'cheque') NOT NULL,
    reference_transaction VARCHAR(100) UNIQUE, -- Référence MVola/Orange Money
    statut ENUM('en_attente', 'valide', 'echoue', 'rembourse') DEFAULT 'en_attente',
    numero_telephone VARCHAR(20), -- Pour mobile money
    preuve_paiement VARCHAR(255), -- URL du reçu/capture
    commission_plateforme DECIMAL(10, 2) DEFAULT 0, -- Commission AgriConnect
    montant_net DECIMAL(12, 2), -- Montant après commission
    date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (payeur_id) REFERENCES users(id),
    FOREIGN KEY (beneficiaire_id) REFERENCES users(id),
    INDEX idx_commande (commande_id),
    INDEX idx_statut (statut),
    INDEX idx_methode (methode_paiement)
);

-- Table: notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    type ENUM('commande', 'paiement', 'message', 'systeme', 'alerte') NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    lien VARCHAR(255), -- URL vers l'élément concerné
    reference_id INT, -- ID de la commande/message/etc.
    reference_type VARCHAR(50), -- Type de référence (commande, produit, etc.)
    lu BOOLEAN DEFAULT FALSE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_lecture DATETIME,
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_lu (lu),
    INDEX idx_date (date_creation)
);

-- Table: messages (Messagerie entre utilisateurs)
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediteur_id INT NOT NULL,
    destinataire_id INT NOT NULL,
    contenu TEXT NOT NULL,
    type_contenu ENUM('texte', 'image', 'document') DEFAULT 'texte',
    fichier_url VARCHAR(255),
    lu BOOLEAN DEFAULT FALSE,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_lecture DATETIME,
    FOREIGN KEY (expediteur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destinataire_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (expediteur_id, destinataire_id),
    INDEX idx_date (date_envoi),
    INDEX idx_lu (lu)
);

-- Table: conversations (Regroupement des messages)
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_1_id INT NOT NULL,
    participant_2_id INT NOT NULL,
    dernier_message_id INT,
    messages_non_lus_p1 INT DEFAULT 0,
    messages_non_lus_p2 INT DEFAULT 0,
    date_derniere_activite DATETIME DEFAULT CURRENT_TIMESTAMP,
    archive_p1 BOOLEAN DEFAULT FALSE,
    archive_p2 BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (participant_1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dernier_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    UNIQUE KEY unique_conversation (participant_1_id, participant_2_id),
    INDEX idx_participants (participant_1_id, participant_2_id)
);

-- Table: evaluations (Notes et avis)
CREATE TABLE evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    evaluateur_id INT NOT NULL, -- Qui note
    evalue_id INT NOT NULL, -- Qui est noté
    note INT CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    criteres JSON, -- Ex: {"qualite": 5, "ponctualite": 4, "communication": 5}
    date_evaluation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluateur_id) REFERENCES users(id),
    FOREIGN KEY (evalue_id) REFERENCES users(id),
    INDEX idx_evalue (evalue_id),
    INDEX idx_note (note)
);

-- Table: favoris (Produits favoris des collecteurs)
CREATE TABLE favoris (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    produit_id INT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favori (utilisateur_id, produit_id),
    INDEX idx_utilisateur (utilisateur_id)
);

-- Table: historique_prix (Suivi des variations de prix)
CREATE TABLE historique_prix (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    ancien_prix DECIMAL(10, 2) NOT NULL,
    nouveau_prix DECIMAL(10, 2) NOT NULL,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    INDEX idx_produit (produit_id),
    INDEX idx_date (date_modification)
);

-- Table: statistiques_utilisateur (Métriques et performances)
CREATE TABLE statistiques_utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    volume_total DECIMAL(12, 2) DEFAULT 0, -- En kg ou montant
    montant_total DECIMAL(15, 2) DEFAULT 0, -- En Ariary
    note_moyenne DECIMAL(3, 2) DEFAULT 0,
    taux_reussite DECIMAL(5, 2) DEFAULT 0, -- Pourcentage
    nombre_evaluations INT DEFAULT 0,
    derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: alertes_stock (Alertes de rupture de stock)
CREATE TABLE alertes_stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    seuil_alerte DECIMAL(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    INDEX idx_produit (produit_id)
);

-- Table: logs_activite (Traçabilité et audit)
CREATE TABLE logs_activite (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT,
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(50), -- Table concernée (users, produits, etc.)
    entite_id INT, -- ID de l'élément modifié
    details JSON, -- Détails de l'action
    ip_address VARCHAR(45),
    user_agent TEXT,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_action (action),
    INDEX idx_date (date_action)
);

-- Table: configurations_systeme (Paramètres globaux)
CREATE TABLE configurations_systeme (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -- ============================================
-- -- VUES UTILES
-- -- ============================================

-- -- Vue: Produits avec informations du paysan
-- CREATE VIEW v_produits_complets AS
-- SELECT 
--     p.*,
--     u.nom AS paysan_nom,
--     u.prenom AS paysan_prenom,
--     u.telephone AS paysan_telephone,
--     u.localisation AS paysan_localisation,
--     u.latitude AS paysan_latitude,
--     u.longitude AS paysan_longitude,
--     COALESCE(AVG(e.note), 0) AS note_moyenne_paysan
-- FROM produits p
-- JOIN users u ON p.paysan_id = u.id
-- LEFT JOIN evaluations e ON e.evalue_id = u.id
-- WHERE p.statut = 'disponible'
-- GROUP BY p.id;

-- -- Vue: Commandes avec détails complets
-- CREATE VIEW v_commandes_completes AS
-- SELECT 
--     c.*,
--     p.nom AS produit_nom,
--     p.type AS produit_type,
--     p.image_url AS produit_image,
--     col.nom AS collecteur_nom,
--     col.prenom AS collecteur_prenom,
--     col.telephone AS collecteur_telephone,
--     pay.nom AS paysan_nom,
--     pay.prenom AS paysan_prenom,
--     pay.telephone AS paysan_telephone,
--     t.statut AS statut_paiement,
--     t.methode_paiement
-- FROM commandes c
-- JOIN produits p ON c.produit_id = p.id
-- JOIN users col ON c.collecteur_id = col.id
-- JOIN users pay ON c.paysan_id = pay.id
-- LEFT JOIN transactions t ON t.commande_id = c.id;

-- -- Vue: Statistiques par utilisateur
-- CREATE VIEW v_stats_utilisateurs AS
-- SELECT 
--     u.id,
--     u.nom,
--     u.prenom,
--     u.role,
--     COUNT(DISTINCT CASE WHEN u.role = 'paysan' THEN p.id END) AS nb_produits,
--     COUNT(DISTINCT CASE WHEN u.role = 'paysan' THEN c.id END) AS nb_commandes_recues,
--     COUNT(DISTINCT CASE WHEN u.role = 'collecteur' THEN c.id END) AS nb_commandes_passees,
--     COALESCE(SUM(CASE WHEN u.role = 'paysan' THEN t.montant_net END), 0) AS revenus_total,
--     COALESCE(SUM(CASE WHEN u.role = 'collecteur' THEN t.montant END), 0) AS depenses_total,
--     COALESCE(AVG(e.note), 0) AS note_moyenne
-- FROM users u
-- LEFT JOIN produits p ON u.id = p.paysan_id
-- LEFT JOIN commandes c ON (u.id = c.paysan_id OR u.id = c.collecteur_id)
-- LEFT JOIN transactions t ON c.id = t.commande_id AND t.statut = 'valide'
-- LEFT JOIN evaluations e ON u.id = e.evalue_id
-- GROUP BY u.id;

-- -- ============================================
-- -- INDEXES SUPPLÉMENTAIRES POUR PERFORMANCE
-- -- ============================================

-- CREATE INDEX idx_produits_search ON produits(nom, type, localisation);
-- CREATE INDEX idx_commandes_dates ON commandes(date_commande, date_livraison_prevue);
-- CREATE INDEX idx_transactions_dates ON transactions(date_transaction);
-- CREATE FULLTEXT INDEX idx_produits_fulltext ON produits(nom, description);

-- -- ============================================
-- -- DONNÉES INITIALES (Configuration)
-- -- ============================================

-- INSERT INTO configurations_systeme (cle, valeur, type, description) VALUES
-- ('commission_plateforme', '5', 'number', 'Commission en pourcentage sur chaque transaction'),
-- ('delai_livraison_defaut', '7', 'number', 'Délai de livraison par défaut en jours'),
-- ('seuil_stock_alerte', '50', 'number', 'Seuil par défaut pour alerte de stock (kg)'),
-- ('devise', 'Ar', 'string', 'Devise utilisée (Ariary)'),
-- ('contact_support', 'support@agriconnect.mg', 'string', 'Email du support'),
-- ('telephone_support', '+261 34 00 000 00', 'string', 'Téléphone du support');