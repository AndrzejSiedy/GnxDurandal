namespace Gnx.Migrations
{
    using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Helpers;

    internal sealed class Configuration : DbMigrationsConfiguration<Gnx.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        private UserManager<IdentityUser> _UserManager { get; set; }

        private RoleManager<IdentityRole> _RoleManager { get; set; }

        protected override void Seed(Gnx.Models.ApplicationDbContext context)
        {

            _UserManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>(context));
            _RoleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));

            try
            {
                // create set of roles
                var adminRole = new IdentityRole()
                {
                    Name = "administrator"
                };
                var createAdminRole = _RoleManager.CreateAsync(adminRole);

                var superUserRole = new IdentityRole()
                {
                    Name = "superuser"
                };
                var createSuperUserRole = _RoleManager.CreateAsync(superUserRole);

                var authenticatedUserRole = new IdentityRole()
                {
                    Name = "authenticated"
                };
                var createAuthenticatedUserRole = _RoleManager.CreateAsync(authenticatedUserRole);
                var guestUserRole = new IdentityRole()
                {
                    Name = "guest"
                };
                var createGuestUserRole = _RoleManager.CreateAsync(guestUserRole);




                // create admin user
                var admin = new IdentityUser
                {
                    UserName = "admin",
                    Email = "admin@geonetix.pl",
                    PasswordHash = Crypto.HashPassword("test111")
                };

                IdentityResult resultCreateAdmin = _UserManager.Create(admin, "test111");


                var userAdmin = _UserManager.FindByEmail("admin@geonetix.pl");
                var roleresult = _UserManager.AddToRole(userAdmin.Id, "administrator");
            }
            catch (Exception ex)
            {
                string stoper = ex.Message;
            }


            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //
            //    context.People.AddOrUpdate(
            //      p => p.FullName,
            //      new Person { FullName = "Andrew Peters" },
            //      new Person { FullName = "Brice Lambson" },
            //      new Person { FullName = "Rowan Miller" }
            //    );
            //
        }
    }
}
