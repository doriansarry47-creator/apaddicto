-- Migration pour ajouter les champs Options variables à la table exercise_library
-- Ajout des champs personnalisables pour paramétrage futur

ALTER TABLE "exercise_library" ADD COLUMN "option_variable_1" text;
ALTER TABLE "exercise_library" ADD COLUMN "option_variable_2" text;
ALTER TABLE "exercise_library" ADD COLUMN "option_variable_3" text;