namespace PictioBonjour.services
{
    public class EmojieGeneratorService
    {
        private List<string> emojis = new List<string>();
        public string randomTargetEmojie {  get; private  set; }
        public EmojieGeneratorService()
        {
            addEmojisToListEmjis();
            GenerateTargetEmoji();
            GeneratePotentialEmoji();
          
        }

        private void addEmojisToListEmjis()
        {
            string path = @"Ressource/Emojis.txt";
            try
            {
                if (File.Exists(path))
                {
                    using (StreamReader sr = File.OpenText(path))
                    {
                        string s = "";
                        while ((s = sr.ReadLine()) != null)
                        {

                            emojis.Add(s);
                        }
                    }
                }
                else
                {
                    Console.WriteLine("Fichier introuvable");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public string GenerateTargetEmoji()
        {
            if (emojis == null || emojis.Count == 0)
            {
                throw new InvalidOperationException("La liste des emojis est vide ou nulle.");
            }
            Random targetEmojieRand = new Random();
            int randomIndex = targetEmojieRand.Next(emojis.Count);
            randomTargetEmojie = emojis[randomIndex];
             return randomTargetEmojie;
        }
        public List<string> GeneratePotentialEmoji()
        {
            
            if (emojis == null || emojis.Count == 0)
            {
                throw new InvalidOperationException("La liste des emojis est vide ou nulle.");
            }

            HashSet<string> uniqueEmojis = new HashSet<string> { randomTargetEmojie };
            Random random = new Random();

            while (uniqueEmojis.Count < 6) // 1 cible + 5 options = 6 au total
            {
                int randomIndex = random.Next(emojis.Count);
                uniqueEmojis.Add(emojis[randomIndex]);
            }

            return uniqueEmojis.ToList();

        }
    }
}

